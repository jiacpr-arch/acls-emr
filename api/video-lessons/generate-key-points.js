import { requireAdmin } from '../_lib/requireAdmin.js';
import { fetchYouTubeTranscript } from '../_lib/youtubeTranscript.js';

export const config = { maxDuration: 60 };

const MODEL = 'claude-opus-5';
const TRANSCRIPT_CHAR_CAP = 30000;

/**
 * Draft the "key points" (สรุปประเด็น) markdown bullets for one video-lesson clip
 * using Claude — admin-only, does not write to the DB (the client persists the
 * result via updateVideoLesson).
 *
 * For YouTube clips we fetch the clip's captions (transcript) first so the draft
 * is grounded in what is actually said in the video; when no transcript exists
 * (Drive clips, captions disabled, or YouTube blocks the fetch) we fall back to
 * title/topic/chapters + standard ACLS/BLS guidelines. Either way the draft is
 * meant to be reviewed by the admin before saving.
 *
 * Body: { title, topicLabel, chapters, keyPoints, youtubeId, startSec, endSec }
 *   → { keyPoints: "- ...\n- ...", source: 'transcript'|'metadata' }
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await requireAdmin(req);
  } catch (err) {
    return res.status(err.status || 401).json({ error: err.message });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const body = typeof req.body === 'string' ? safeJson(req.body) : (req.body || {});
  const title = String(body.title || '').trim();
  if (!title) return res.status(400).json({ error: 'title required' });
  const topicLabel = String(body.topicLabel || '').trim();
  const chapters = Array.isArray(body.chapters) ? body.chapters : [];
  // สรุปเดิม (ถ้ามี) ส่งเป็นบริบทให้ AI ปรับปรุงต่อ แทนที่จะร่างจากศูนย์
  const existing = String(body.keyPoints || '').trim().slice(0, 4000);

  // "เข้าไปดูคลิปจริง": คลิป YouTube ดึงคำบรรยายมาให้ AI อ่าน (Drive/ไม่มีคำบรรยาย → null)
  const youtubeId = String(body.youtubeId || '').trim();
  const startSec = body.startSec === '' || body.startSec == null ? null : Number(body.startSec);
  const endSec = body.endSec === '' || body.endSec == null ? null : Number(body.endSec);
  const transcriptResult = /^[\w-]{11}$/.test(youtubeId)
    ? await fetchYouTubeTranscript(youtubeId, { startSec, endSec })
    : null;
  const transcript = transcriptResult?.text?.slice(0, TRANSCRIPT_CHAR_CAP) || '';

  const prompt = buildPrompt({ title, topicLabel, chapters, existing, transcript });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'server-side-fallback-2026-07-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 2048,
        // ถ้า classifier ปฏิเสธ (เนื้อหาการแพทย์อาจโดน false positive) ให้ retry บนโมเดลสำรองอัตโนมัติ
        fallbacks: 'default',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error(`generate-key-points: upstream ${response.status}:`, err.slice(0, 500));
      return res.status(502).json({ error: 'AI service unavailable — กรุณาลองใหม่ภายหลัง' });
    }

    const data = await response.json();
    if (data.stop_reason === 'refusal') {
      console.error('generate-key-points: refusal', data.stop_details);
      return res.status(502).json({ error: 'AI ปฏิเสธคำขอนี้ กรุณาลองใหม่' });
    }
    const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
    const keyPoints = extractBullets(text);

    if (!keyPoints) {
      console.error('generate-key-points: invalid AI output:', text.slice(0, 500));
      return res.status(502).json({ error: 'AI สร้างสรุปไม่สำเร็จ กรุณาลองใหม่' });
    }

    return res.status(200).json({ keyPoints, source: transcript ? 'transcript' : 'metadata' });
  } catch (err) {
    console.error('generate-key-points failed:', err);
    return res.status(500).json({ error: 'Failed to generate key points — please try again later' });
  }
}

function buildPrompt({ title, topicLabel, chapters, existing, transcript }) {
  const chapterLines = chapters
    .map(c => `- ${c.label || ''}`.trim())
    .filter(l => l !== '-')
    .join('\n');

  return `คุณเป็นผู้สอน ACLS/BLS สำหรับบุคลากรทางการแพทย์ชาวไทย

ร่าง "สรุปประเด็นสำคัญ" สำหรับคลิปวิดีโอบทเรียนนี้ เพื่อให้ผู้เรียนอ่านทวนหลังดูคลิปจบ:

หัวข้อหมวด: ${topicLabel || '-'}
ชื่อคลิป: ${title}
สารบัญช่วงเวลาในคลิป:
${chapterLines || '(ไม่มี)'}
${transcript ? `\nคำบรรยายจากในคลิป (ถอดจาก caption ของ YouTube — นี่คือเนื้อหาที่พูดจริงในคลิป):\n<transcript>\n${transcript}\n</transcript>\n` : ''}
${existing ? `สรุปเดิมที่แอดมินเขียนไว้ (ปรับปรุง/เติมให้ครบถ้วนขึ้น โดยคงประเด็นเดิมที่ถูกต้องไว้):\n${existing}` : ''}

กติกา (สำคัญมาก):
${transcript
    ? '1. สรุปจากเนื้อหาใน <transcript> เป็นหลัก — เอาเฉพาะประเด็นที่พูดจริงในคลิป (คำบรรยายอาจถอดเสียงผิดเพี้ยน ให้ตีความตามบริบทแนวทาง AHA ACLS/BLS ฉบับปัจจุบัน และแก้คำศัพท์การแพทย์ที่ถอดผิดให้ถูก) ห้ามเพิ่มหัวข้อที่คลิปไม่ได้พูดถึง'
    : '1. อิงแนวทาง AHA ACLS/BLS ฉบับปัจจุบันเท่านั้น เขียนเฉพาะประเด็นที่มั่นใจว่าถูกต้องตามแนวทางมาตรฐาน ถ้าไม่แน่ใจตัวเลข/ขนาดยา ให้เว้นไว้ ไม่เดา'}
2. เขียน 4-8 bullet เรียงตามลำดับเนื้อหาในคลิป
3. แต่ละ bullet กระชับ 1-2 ประโยค ภาษาไทย (คำศัพท์ทางการแพทย์ใช้ภาษาอังกฤษได้)
4. ตัวเลขเชิงปฏิบัติ (เช่น อัตรากดหน้าอก ความลึก พลังงาน defibrillation ขนาดยา) ใส่เฉพาะที่${transcript ? 'พูดถึงในคลิปหรือ' : ''}เป็นมาตรฐานและเกี่ยวข้องกับหัวข้อโดยตรง

ตอบกลับเป็น markdown bullet list เท่านั้น (ขึ้นต้นแต่ละบรรทัดด้วย "- ") ไม่ต้องมีหัวเรื่องหรือข้อความอื่น`;
}

// ดึงเฉพาะบรรทัด bullet ("- ..." หรือ "* ...") — กันกรณี AI แถมข้อความเปิด/ปิด
function extractBullets(text) {
  if (!text) return '';
  const lines = text.split('\n').map(l => l.trim()).filter(l => /^[-*]\s+\S/.test(l));
  if (lines.length < 2) return '';
  return lines.map(l => l.replace(/^\*\s+/, '- ')).join('\n');
}

function safeJson(s) {
  try { return JSON.parse(s); } catch { return {}; }
}
