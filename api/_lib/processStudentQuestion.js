import { getSupabaseAdmin } from './supabaseAdmin.js';

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
  const classification = await deepseekClassify(row.question, answer, chapters);

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
    'ให้คำตอบเชิงลึกเป็นภาษาไทย กระชับแต่ครบถ้วน เหมาะกับบุคลากรทางการแพทย์ที่กำลังเรียน ACLS',
    'รูปแบบคำตอบ (Markdown):',
    '- เริ่มด้วยสรุป 1-2 ประโยค',
    '- อธิบายเหตุผล/กลไก/ขั้นตอนเป็นหัวข้อย่อย ใช้ ## หรือ ### และ bullet',
    '- ถ้ามีตัวเลข dose/เวลา/criteria ให้ใส่ในตารางหรือ bullet ที่ชัดเจน',
    '- จบด้วย "ข้อควรระวัง" หรือ "Take-home points" 2-4 ข้อ',
    'ห้ามแต่งข้อมูลที่ไม่แน่ใจ ถ้าไม่ทราบให้บอกว่าไม่ทราบและแนะนำให้ปรึกษาแหล่งอ้างอิง',
    'ความยาวรวมประมาณ 250-600 คำ',
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

async function deepseekClassify(question, answer, chapters) {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) throw new Error('DEEPSEEK_API_KEY not configured');

  const catalog = chapters
    .map(c => `- id="${c.id}" :: ${c.title}`)
    .join('\n');

  const systemPrompt = [
    'You classify ACLS Q&A items into one of the existing chapter ids.',
    'Pick the SINGLE best matching chapter id from the list below.',
    'If absolutely none fits, return chapterId="" (empty string).',
    'Reply with strict JSON only: {"chapterId": "ch1", "reason": "สั้นๆ"}',
    '',
    'Chapter catalog:',
    catalog,
  ].join('\n');

  const userPrompt = [
    `Question:\n${question}`,
    '',
    `Answer (first 1500 chars):\n${answer.slice(0, 1500)}`,
  ].join('\n');

  const resp = await fetch(DEEPSEEK_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0,
      max_tokens: 200,
      response_format: { type: 'json_object' },
    }),
  });
  if (!resp.ok) {
    return { chapterId: null, reason: `classify failed: ${resp.status}` };
  }
  const data = await resp.json();
  const raw = data?.choices?.[0]?.message?.content?.trim() || '{}';
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { chapterId: null, reason: `parse failed: ${raw.slice(0, 200)}` };
  }
  const valid = new Set(chapters.map(c => c.id));
  const chapterId = parsed.chapterId && valid.has(parsed.chapterId) ? parsed.chapterId : null;
  return { chapterId, reason: String(parsed.reason || '').slice(0, 500) };
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
