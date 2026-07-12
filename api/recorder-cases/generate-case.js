import { requireAdmin } from '../_lib/requireAdmin.js';

export const config = { maxDuration: 60 };

const MODEL = 'claude-sonnet-4-6';

// รายการที่อนุญาต — ให้ AI ใช้ id ที่เกมรู้จัก + validator ตรวจซ้ำ
// (hardcode ไว้ที่นี่เพื่อเลี่ยง import ข้ามขอบเขต api/src)
const BUTTONS = [
  'check_rhythm', 'shock', 'drug', 'airway', 'ht', 'rosc',
  'assess', 'vagal', 'cardiovert', 'pacing', 'drug_choice',
  'fast', 'ct_brain', 'tpa', 'mona', 'twelve_lead', 'cath', 'monitor',
];
const ARREST_RHYTHMS = ['vf', 'pvt', 'pea', 'asystole'];
const CATEGORIES = ['cardiac_arrest', 'bradycardia', 'tachycardia', 'mi', 'stroke', 'special'];

/**
 * ให้ Claude ร่าง "เคส" ของเกม Recorder Hero (ภาษาไทย) — admin only, ไม่เขียน DB
 * เคสที่ได้เป็นร่าง (status draft) เสมอ ต้องผ่านการตรวจของแอดมินก่อนเผยแพร่
 *
 * Body: { category, difficulty, brief }
 *   → { case: {...}, warnings: [...] }
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await requireAdmin(req);
  } catch (err) {
    return res.status(err.status || 401).json({ error: err.message });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  const body = typeof req.body === 'string' ? safeJson(req.body) : (req.body || {});
  const category = CATEGORIES.includes(body.category) ? body.category : 'cardiac_arrest';
  const difficulty = String(body.difficulty || 'basic').trim().slice(0, 20);
  const brief = String(body.brief || '').trim().slice(0, 2000);

  const prompt = buildPrompt({ category, difficulty, brief });

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
        max_tokens: 3000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error(`generate-case: upstream ${response.status}:`, err.slice(0, 500));
      return res.status(502).json({ error: 'AI service unavailable — กรุณาลองใหม่ภายหลัง' });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    const raw = extractCase(text);
    if (!raw) {
      console.error('generate-case: unparseable AI output:', text.slice(0, 500));
      return res.status(502).json({ error: 'AI สร้างเคสไม่สำเร็จ กรุณาลองใหม่' });
    }
    const { case: normalized, warnings } = normalizeCase(raw, category, difficulty);
    if (!normalized || !normalized.events.length) {
      return res.status(502).json({ error: 'AI สร้างเคสไม่ครบ กรุณาลองใหม่' });
    }
    return res.status(200).json({ case: normalized, warnings });
  } catch (err) {
    console.error('generate-case failed:', err);
    return res.status(500).json({ error: 'Failed to generate case — please try again later' });
  }
}

function buildPrompt({ category, difficulty, brief }) {
  return `คุณเป็นผู้เชี่ยวชาญ ACLS/BLS ที่ออกแบบ "เคสฝึกการบันทึก (recorder)" สำหรับบุคลากรทางการแพทย์ชาวไทย

สร้างเคสจำลอง 1 เคส หมวด "${category}" ระดับ "${difficulty}"
${brief ? `โจทย์เพิ่มเติมจากผู้สร้าง: ${brief}` : ''}

เคสคือลำดับเหตุการณ์ที่เกิดตามเวลา (วินาที) ผู้เล่นเป็น "ผู้บันทึก" ต้องกดปุ่มบันทึกให้ถูกและทันเวลา

ปุ่ม (buttonId) ที่ใช้ได้เท่านั้น: ${BUTTONS.join(', ')}
- check_rhythm → ต้องมี data.rhythm เป็นหนึ่งใน: ${ARREST_RHYTHMS.join(', ')}
- shock, cardiovert → ต้องมี data.energy เป็นตัวเลข (J)
- drug (เฉพาะ arrest) → data.drug เช่น epinephrine_arrest, amiodarone_first, calcium_chloride
- drug_choice (non-arrest) → data.choice เช่น atropine_1mg, adenosine_6mg, adrenaline_im, naloxone, calcium_gluconate
- ปุ่มอื่น (assess, vagal, pacing, fast, ct_brain, tpa, mona, twelve_lead, cath, monitor, airway, ht, rosc) ไม่ต้องมี data

กติกาสำคัญ (ความปลอดภัยผู้ป่วยมาก่อน):
1. ใช้ค่ายา/พลังงาน/จังหวะตามมาตรฐาน ACLS จริงเท่านั้น ห้ามแต่งค่าที่ไม่ถูกต้อง (เช่น Epinephrine 1mg, Amiodarone 300mg, VF shock แรก 120J ต่อไป 200J)
2. เหตุการณ์เรียงตามเวลา t เพิ่มขึ้น เริ่มประมาณ 5 วินาที ห่างกัน 8-16 วินาที
3. เหตุการณ์สุดท้ายต้องเป็นการจบเคส (rosc สำหรับ arrest, หรือ monitor สำหรับ non-arrest)
4. narration_th, missFeedback_th, wrongDataFeedback_th เป็นภาษาไทยล้วน กระชับ
5. เคสระดับ basic 5-7 เหตุการณ์, intermediate/advanced 6-9 เหตุการณ์

ตอบกลับเป็น JSON เท่านั้น ไม่มีข้อความอื่น ตามรูปแบบนี้เป๊ะ ๆ:
{"case": {
  "title_th": "...",
  "category": "${category}",
  "difficulty": "${difficulty}",
  "intro_th": "...",
  "wrongPressPenalty": 15,
  "initialScene": {"rhythm": "vf", "hr": 0, "bp": "0/0", "spo2": 0, "etco2": 12, "consciousness": "unresponsive"},
  "events": [
    {"t": 6, "narration_th": "...", "scene": {"rhythm": "vf"}, "expect": {"buttonId": "check_rhythm", "data": {"rhythm": "vf"}}, "window": {"perfect": 3, "good": 6, "late": 11}, "points": 100, "missFeedback_th": "...", "wrongDataFeedback_th": "..."}
  ]
}}`;
}

function extractCase(text) {
  if (!text) return null;
  const fenced = text.match(/```json\s*([\s\S]*?)```/i) || text.match(/```\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  const first = candidate.indexOf('{');
  const last = candidate.lastIndexOf('}');
  if (first === -1 || last === -1) return null;
  try {
    const parsed = JSON.parse(candidate.slice(first, last + 1));
    return parsed.case || parsed;
  } catch {
    return null;
  }
}

// บังคับ shape + สร้าง warnings ให้แอดมินตรวจ (ไม่ทิ้งเคส แค่เตือน)
function normalizeCase(raw, category, difficulty) {
  const warnings = [];
  const clampStr = (s, n) => String(s || '').trim().slice(0, n);

  const events = Array.isArray(raw.events) ? raw.events : [];
  const normEvents = [];
  events.forEach((e, i) => {
    if (!e || typeof e !== 'object') return;
    const t = Number(e.t);
    const buttonId = String(e.expect?.buttonId || '');
    if (!Number.isFinite(t)) { warnings.push(`event ${i + 1}: ไม่มีเวลา t`); return; }
    if (!BUTTONS.includes(buttonId)) { warnings.push(`event ${i + 1}: buttonId "${buttonId}" ไม่รู้จัก`); }

    const data = e.expect?.data && typeof e.expect.data === 'object' ? e.expect.data : undefined;
    if (buttonId === 'check_rhythm' && data && !ARREST_RHYTHMS.includes(String(data.rhythm))) {
      warnings.push(`event ${i + 1}: rhythm "${data.rhythm}" ไม่อยู่ในรายการ — ตรวจสอบ`);
    }
    if ((buttonId === 'shock' || buttonId === 'cardiovert')) {
      const energy = Number(data?.energy);
      if (!Number.isFinite(energy) || energy < 20 || energy > 400) {
        warnings.push(`event ${i + 1}: พลังงาน "${data?.energy}" ผิดปกติ — ตรวจสอบ`);
      }
    }
    if ((buttonId === 'drug' || buttonId === 'drug_choice') && !data) {
      warnings.push(`event ${i + 1}: ${buttonId} ควรระบุ dose/ยา`);
    }

    const w = e.window || {};
    normEvents.push({
      t,
      narration_th: clampStr(e.narration_th, 300),
      scene: (e.scene && typeof e.scene === 'object') ? e.scene : {},
      expect: { buttonId, ...(data ? { data } : {}) },
      window: {
        perfect: Number(w.perfect) || 3,
        good: Number(w.good) || 6,
        late: Number(w.late) || 11,
      },
      points: Number(e.points) || 100,
      missFeedback_th: clampStr(e.missFeedback_th, 200),
      wrongDataFeedback_th: clampStr(e.wrongDataFeedback_th, 200),
    });
  });

  normEvents.sort((a, b) => a.t - b.t);

  if (!normEvents.length) { warnings.push('ไม่มีเหตุการณ์ในเคส'); }
  const lastBtn = normEvents.length ? normEvents[normEvents.length - 1].expect.buttonId : '';
  if (!['rosc', 'monitor'].includes(lastBtn)) {
    warnings.push('เหตุการณ์สุดท้ายควรเป็น ROSC หรือ monitor (จบเคส)');
  }

  const cased = {
    title_th: clampStr(raw.title_th, 120) || 'เคสใหม่',
    category: CATEGORIES.includes(raw.category) ? raw.category : category,
    difficulty: clampStr(raw.difficulty, 20) || difficulty,
    intro_th: clampStr(raw.intro_th, 400),
    wrongPressPenalty: Number(raw.wrongPressPenalty) || 15,
    initialScene: (raw.initialScene && typeof raw.initialScene === 'object') ? raw.initialScene : {},
    events: normEvents,
    source: 'ai',
  };
  return { case: cased, warnings };
}

function safeJson(s) {
  try { return JSON.parse(s); } catch { return {}; }
}
