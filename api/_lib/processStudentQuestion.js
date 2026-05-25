import { getSupabaseAdmin } from './supabaseAdmin.js';
import { classifyChapter } from './classifyChapter.js';

const IMAGES_BUCKET = 'acls-images';
const STORAGE_DIR = 'student-questions';

const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions';
const OPENAI_IMAGE_URL = 'https://api.openai.com/v1/images/generations';

/**
 * Runs the full pipeline for one student question:
 *   DeepSeek answer  →  DeepSeek classify chapter  →  OpenAI image  →  upload  →  save
 * Updates the row in acls_student_questions in-place. Throws on hard failure
 * (the caller is responsible for writing status='failed' + error_message).
 */
export async function processStudentQuestion(rowId) {
  const supabase = getSupabaseAdmin();

  // 1. Load the row + chapter catalog
  const { data: row, error: rowErr } = await supabase
    .from('acls_student_questions')
    .select('id, question, status')
    .eq('id', rowId)
    .maybeSingle();
  if (rowErr) throw rowErr;
  if (!row) throw new Error(`Question ${rowId} not found`);
  if (row.status === 'published') {
    throw new Error('Question already published — cannot reprocess');
  }

  const { data: chapters, error: chErr } = await supabase
    .from('acls_chapters')
    .select('id, title')
    .order('sort_order');
  if (chErr) throw chErr;

  // Mark as processing so concurrent triggers no-op
  await supabase
    .from('acls_student_questions')
    .update({ status: 'processing', error_message: null, updated_at: new Date().toISOString() })
    .eq('id', rowId);

  // 2. Get an in-depth answer from DeepSeek
  const answer = await deepseekAnswer(row.question);

  // 3. Classify into one of the existing chapters (or null)
  const classification = await classifyChapter({
    question: row.question,
    answer,
    chapters,
  });

  // 4. Build an image prompt + generate
  const imagePrompt = buildImagePrompt(row.question, answer);
  let imageUrl = null;
  let imageError = null;
  try {
    const b64 = await openaiImage(imagePrompt);
    imageUrl = await uploadImage(supabase, rowId, b64);
  } catch (err) {
    // Image gen is best-effort — keep the answer even if it fails.
    imageError = err?.message || String(err);
  }

  // 5. Save everything as a draft for admin review
  const update = {
    status: 'draft_ready',
    deepseek_answer: answer,
    suggested_chapter_id: classification.chapterId,
    classification_reason: classification.reason,
    image_prompt: imagePrompt,
    generated_image_url: imageUrl,
    error_message: imageError ? `image: ${imageError}` : null,
    processed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  const { error: upErr } = await supabase
    .from('acls_student_questions')
    .update(update)
    .eq('id', rowId);
  if (upErr) throw upErr;
}

// ───────────────────────── DeepSeek ─────────────────────────

async function deepseekAnswer(question) {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) throw new Error('DEEPSEEK_API_KEY not configured');

  const systemPrompt = [
    'คุณเป็นอาจารย์แพทย์ผู้เชี่ยวชาญ ACLS (Advanced Cardiac Life Support) ตามแนวทาง AHA ล่าสุด',
    'ตอบเป็นภาษาไทย เชิงลึก กระชับแต่ครบถ้วน เหมาะกับบุคลากรทางการแพทย์ที่กำลังเรียน ACLS',
    '',
    'สำคัญมาก — ต้องจัดรูปแบบคำตอบเป็น Markdown ที่มีโครงสร้างชัดเจนและอ่านง่าย ตามนี้:',
    '- ขึ้นต้นด้วยบทสรุป 1–2 ประโยค (ย่อหน้าธรรมดา ไม่มีหัวข้อ)',
    '- แบ่งเนื้อหาเป็นหัวข้อหลักด้วย "## ชื่อหัวข้อ" และหัวข้อย่อยด้วย "### ชื่อหัวข้อย่อย"',
    '- ใช้ bullet ขึ้นต้นด้วย "- " สำหรับรายการ และเลข "1." สำหรับลำดับขั้นตอน',
    '- ทำ **ตัวหนา** กับคำสำคัญ ชื่อยา ขนาดยา และตัวเลขสำคัญ (เช่น **Epinephrine 1 mg IV**)',
    '- ถ้ามีหลายค่า/เกณฑ์/ขนาดยา-เวลา ให้จัดเป็นตาราง Markdown',
    '- ปิดท้ายด้วยหัวข้อ "## ข้อควรระวัง" หรือ "## Take-home points" เป็น bullet 2–4 ข้อ',
    '',
    'กฎการเว้นบรรทัด (ห้ามพลาด): คั่นทุกบล็อก (หัวข้อ / ย่อหน้า / รายการ / ตาราง) ด้วยบรรทัดว่าง 1 บรรทัดเสมอ',
    'ห้ามตอบเป็นข้อความยาวติดกันเป็นพรืดโดยไม่มีหัวข้อหรือบรรทัดว่างคั่นเด็ดขาด',
    '',
    'ห้ามแต่งข้อมูลที่ไม่แน่ใจ ถ้าไม่ทราบให้บอกว่าไม่ทราบและแนะนำให้ปรึกษาแหล่งอ้างอิง',
    'ความยาวรวมประมาณ 250–600 คำ',
  ].join('\n');

  const body = {
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: question },
    ],
    temperature: 0.3,
    max_tokens: 2000,
  };

  const resp = await fetch(DEEPSEEK_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`DeepSeek answer failed (${resp.status}): ${text.slice(0, 500)}`);
  }
  const data = await resp.json();
  const text = data?.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('DeepSeek returned empty answer');
  return text;
}

// ───────────────────────── OpenAI image ─────────────────────────

function buildImagePrompt(question, answer) {
  // gpt-image-1 / DALL-E renders Thai text poorly, so prompt for a clean,
  // text-free medical illustration that conveys the *concept* of the Q&A.
  const summary = answer.replace(/[#*_>`-]/g, ' ').slice(0, 400);
  return [
    'Clean modern medical infographic illustration for an ACLS (Advanced Cardiac Life Support) educational app.',
    'Flat vector style, soft gradients, calm clinical color palette (deep blue, white, accents of red and teal).',
    'Centered composition, plenty of white space, suitable as a cover image.',
    'Do NOT include any text, letters, numbers, or labels in the image.',
    `Concept: ${question}`,
    `Visual cue: ${summary}`,
  ].join('\n');
}

async function openaiImage(prompt) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY not configured');
  const resp = await fetch(OPENAI_IMAGE_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-image-1',
      prompt,
      size: '1024x1024',
      n: 1,
    }),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`OpenAI image failed (${resp.status}): ${text.slice(0, 500)}`);
  }
  const data = await resp.json();
  const b64 = data?.data?.[0]?.b64_json;
  if (!b64) throw new Error('OpenAI image returned no b64_json');
  return b64;
}

// ───────────────────────── Storage ─────────────────────────

async function uploadImage(supabase, rowId, b64) {
  const buffer = Buffer.from(b64, 'base64');
  const path = `${STORAGE_DIR}/${rowId}/${Date.now()}.png`;
  const { error: upErr } = await supabase.storage
    .from(IMAGES_BUCKET)
    .upload(path, buffer, {
      contentType: 'image/png',
      cacheControl: '3600',
      upsert: false,
    });
  if (upErr) throw upErr;
  const { data } = supabase.storage.from(IMAGES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
