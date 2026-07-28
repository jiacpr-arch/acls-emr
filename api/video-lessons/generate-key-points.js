import { requireAdmin } from '../_lib/requireAdmin.js';

export const config = { maxDuration: 60 };

const MODEL = 'claude-opus-5';

/**
 * Draft the "key points" (สรุปประเด็น) markdown bullets for one video-lesson clip
 * using Claude — admin-only, does not write to the DB (the client persists the
 * result via updateVideoLesson). The AI cannot watch the video, so the draft is
 * grounded in the clip's title/topic/chapters plus standard ACLS/BLS guidelines,
 * and is meant to be reviewed by the admin before saving.
 *
 * Body: { title, topicLabel, chapters, keyPoints }
 *   → { keyPoints: "- ...\n- ..." }  (markdown bullets, Thai)
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

  const prompt = buildPrompt({ title, topicLabel, chapters, existing });

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

    return res.status(200).json({ keyPoints });
  } catch (err) {
    console.error('generate-key-points failed:', err);
    return res.status(500).json({ error: 'Failed to generate key points — please try again later' });
  }
}

function buildPrompt({ title, topicLabel, chapters, existing }) {
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
${existing ? `สรุปเดิมที่แอดมินเขียนไว้ (ปรับปรุง/เติมให้ครบถ้วนขึ้น โดยคงประเด็นเดิมที่ถูกต้องไว้):\n${existing}` : ''}

กติกา (สำคัญมาก):
1. อิงแนวทาง AHA ACLS/BLS ฉบับปัจจุบันเท่านั้น เขียนเฉพาะประเด็นที่มั่นใจว่าถูกต้องตามแนวทางมาตรฐาน ถ้าไม่แน่ใจตัวเลข/ขนาดยา ให้เว้นไว้ ไม่เดา
2. เขียน 4-8 bullet ครอบคลุมประเด็นตามชื่อคลิปและสารบัญที่ให้มา เรียงตามลำดับเนื้อหา
3. แต่ละ bullet กระชับ 1-2 ประโยค ภาษาไทย (คำศัพท์ทางการแพทย์ใช้ภาษาอังกฤษได้)
4. ใส่ตัวเลขเชิงปฏิบัติที่เป็นมาตรฐาน (เช่น อัตรากดหน้าอก ความลึก พลังงาน defibrillation ขนาดยา) เฉพาะเมื่อเกี่ยวข้องกับหัวข้อโดยตรง

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
