import { requireAdmin } from '../_lib/requireAdmin.js';

export const config = { maxDuration: 60 };

const MODEL = 'claude-sonnet-4-6';
const QUESTION_COUNT = 3;
const CHOICE_IDS = ['a', 'b', 'c', 'd'];

/**
 * Generate a quiz for one video-lesson clip using Claude, grounded strictly in
 * the clip's own title/key_points/chapters — admin-only, does not write to the DB
 * (the client persists the result via updateVideoLesson).
 *
 * Body: { title, keyPoints, chapters, topicLabel }
 *   → { quiz: [{ id, question, choices:[{id,text}], correctId, explanation }, ...] }  (3 ข้อ)
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
  const keyPoints = String(body.keyPoints || '').trim().slice(0, 4000);
  const chapters = Array.isArray(body.chapters) ? body.chapters : [];
  const topicLabel = String(body.topicLabel || '').trim();

  const prompt = buildPrompt({ title, keyPoints, chapters, topicLabel });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error(`generate-quiz: upstream ${response.status}:`, err.slice(0, 500));
      return res.status(502).json({ error: 'AI service unavailable — กรุณาลองใหม่ภายหลัง' });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    const quiz = normalizeQuiz(extractQuiz(text));

    if (quiz.length !== QUESTION_COUNT) {
      console.error('generate-quiz: invalid AI output:', text.slice(0, 500));
      return res.status(502).json({ error: 'AI สร้างควิซไม่สำเร็จ กรุณาลองใหม่' });
    }

    return res.status(200).json({ quiz });
  } catch (err) {
    console.error('generate-quiz failed:', err);
    return res.status(500).json({ error: 'Failed to generate quiz — please try again later' });
  }
}

function buildPrompt({ title, keyPoints, chapters, topicLabel }) {
  const chapterLines = chapters
    .map(c => `- ${c.label || ''}`.trim())
    .filter(l => l !== '-')
    .join('\n');

  return `คุณเป็นผู้เชี่ยวชาญออกข้อสอบ ACLS/BLS สำหรับบุคลากรทางการแพทย์ชาวไทย

สร้างคำถามแบบปรนัย (multiple choice) จำนวน ${QUESTION_COUNT} ข้อ สำหรับคลิปวิดีโอบทเรียนนี้:

หัวข้อหมวด: ${topicLabel || '-'}
ชื่อคลิป: ${title}
สรุปประเด็นสำคัญของคลิป:
${keyPoints || '(ไม่มี)'}
สารบัญช่วงเวลาในคลิป:
${chapterLines || '(ไม่มี)'}

กติกาการออกข้อสอบ (สำคัญมาก):
1. ใช้เนื้อหาเฉพาะจากสรุปประเด็นสำคัญและสารบัญที่ให้มาเท่านั้น ห้ามแต่งข้อมูลเวชปฏิบัติ (เช่น ขนาดยา ค่าตัวเลข ขั้นตอน) ที่ไม่ได้อยู่ในเนื้อหาที่ให้มา
2. แต่ละข้อต้องเป็นคำถามเชิงประยุกต์/สถานการณ์ (ไม่ใช่ลอกประโยคจากสรุปมาถามตรง ๆ)
3. แต่ละข้อมี 4 ตัวเลือก (a, b, c, d) — 1 ข้อถูก ที่เหลือเป็นตัวลวงที่สมเหตุสมผลในบริบทเวชปฏิบัติฉุกเฉิน ห้ามมีตัวเลือกที่ถูกมากกว่าหนึ่งข้อหรือกำกวม
4. ใส่ explanation อธิบายสั้น ๆ (1 ประโยค) ว่าทำไมตัวเลือกนั้นถูก
5. เขียนเป็นภาษาไทยล้วน กระชับ ชัดเจน

ตอบกลับเป็น JSON เท่านั้น ไม่ต้องมีข้อความอื่นนอกเหนือจาก JSON ตามรูปแบบนี้เป๊ะ ๆ:
{"quiz": [
  {"question": "...", "choices": [{"id":"a","text":"..."},{"id":"b","text":"..."},{"id":"c","text":"..."},{"id":"d","text":"..."}], "correctId": "a", "explanation": "..."}
]}`;
}

function extractQuiz(text) {
  if (!text) return [];
  const fenced = text.match(/```json\s*([\s\S]*?)```/i) || text.match(/```\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  const first = candidate.indexOf('{');
  const last = candidate.lastIndexOf('}');
  if (first === -1 || last === -1) return [];
  const slice = candidate.slice(first, last + 1);
  try {
    const parsed = JSON.parse(slice);
    if (Array.isArray(parsed.quiz)) return parsed.quiz;
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [];
  }
}

function normalizeQuiz(rawQuiz) {
  const out = [];
  for (const q of rawQuiz.slice(0, QUESTION_COUNT)) {
    const item = normalizeQuestion(q);
    if (item) out.push(item);
  }
  return out;
}

function normalizeQuestion(q) {
  if (!q || typeof q !== 'object') return null;
  const question = String(q.question || '').trim().slice(0, 500);
  if (!question) return null;

  const rawChoices = Array.isArray(q.choices) ? q.choices : [];
  const choices = rawChoices
    .slice(0, CHOICE_IDS.length)
    .map((c, i) => ({
      id: CHOICE_IDS[i],
      text: String(c?.text || '').trim().slice(0, 300),
    }))
    .filter(c => c.text);
  if (choices.length < 2) return null;

  const correctId = choices.some(c => c.id === q.correctId) ? q.correctId : null;
  if (!correctId) return null;

  return {
    id: crypto.randomUUID().slice(0, 8),
    question,
    choices,
    correctId,
    explanation: String(q.explanation || '').trim().slice(0, 500),
  };
}

function safeJson(s) {
  try { return JSON.parse(s); } catch { return {}; }
}
