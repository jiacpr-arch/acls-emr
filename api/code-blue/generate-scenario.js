import { requireAdmin } from '../_lib/requireAdmin.js';

export const config = { maxDuration: 60 };

const MODEL = 'claude-sonnet-4-6';

// ตัวละคร built-in + สีหน้า + เป้าหมายคำสั่ง ที่เกมรู้จัก (validator ตรวจซ้ำ)
const BUILTIN_CHARACTERS = [
  { key: 'nurse_mint', name: 'พยาบาลมิ้นท์', role: 'Nurse · IV & Drugs' },
  { key: 'boy_compressor', name: 'พี่บอย', role: 'Compressor' },
  { key: 'fon_defib', name: 'หมอฝน', role: 'Defib / Monitor' },
  { key: 'att_dech', name: 'อ.เดช', role: 'Attending' },
  { key: 'krit_airway', name: 'หมอกฤต', role: 'Anesthesia · Airway' },
  { key: 'pae_ems', name: 'พี่เป้ กู้ชีพ', role: 'EMS · 1669' },
  { key: 'mind_runner', name: 'น้องมายด์', role: 'Runner · Lab & CT' },
  { key: 'family_witness', name: 'ญาติผู้ป่วย', role: 'Family · Witness' },
  { key: 'patient_male', name: 'ผู้ป่วยชาย', role: 'Patient' },
];
const POSES = ['idle', 'talk', 'panic', 'stern', 'happy'];
const TARGETS = ['YOU', 'CPR', 'AIRWAY', 'DEFIB', 'DRUG', 'MONITOR', 'IV', 'CT', 'LAB'];
const LEVELS = ['basic', 'intermediate', 'megacode'];
const COURSES = ['acls', 'bls'];

/**
 * ให้ Claude ร่าง "โจทย์" ของเกม Code Blue Simulator (ภาษาไทย) — admin only, ไม่เขียน DB
 * โจทย์ที่ได้เป็นร่าง (status draft) เสมอ ต้องผ่านการตรวจของแอดมินก่อนเผยแพร่
 *
 * Body: { course, level, brief }
 *   → { scenario: {...}, warnings: [...] }
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
  const course = COURSES.includes(body.course) ? body.course : 'acls';
  const level = LEVELS.includes(body.level) ? body.level : 'basic';
  const brief = String(body.brief || '').trim().slice(0, 2000);

  // ตัวละคร custom ที่ client ส่งมา (จากตาราง code_blue_characters) — เพิ่มเข้ารายการที่ AI ใช้ได้
  const customChars = Array.isArray(body.characters)
    ? body.characters
      .filter((c) => c && /^[a-z][a-z0-9_]{2,}$/.test(String(c.key)))
      .slice(0, 30)
      .map((c) => ({ key: String(c.key), name: String(c.name || c.key).slice(0, 60), role: String(c.role || '').slice(0, 60) }))
    : [];
  const characters = [...BUILTIN_CHARACTERS, ...customChars];
  const charKeys = characters.map((c) => c.key);

  const prompt = buildPrompt({ course, level, brief, characters });

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
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error(`generate-scenario: upstream ${response.status}:`, err.slice(0, 500));
      return res.status(502).json({ error: 'AI service unavailable — กรุณาลองใหม่ภายหลัง' });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    const raw = extractScenario(text);
    if (!raw) {
      console.error('generate-scenario: unparseable AI output:', text.slice(0, 500));
      return res.status(502).json({ error: 'AI สร้างโจทย์ไม่สำเร็จ กรุณาลองใหม่' });
    }
    const { scenario: normalized, warnings } = normalizeScenario(raw, course, level, charKeys);
    if (!normalized || !normalized.story.length) {
      return res.status(502).json({ error: 'AI สร้างโจทย์ไม่ครบ กรุณาลองใหม่' });
    }
    return res.status(200).json({ scenario: normalized, warnings });
  } catch (err) {
    console.error('generate-scenario failed:', err);
    return res.status(500).json({ error: 'Failed to generate scenario — please try again later' });
  }
}

function buildPrompt({ course, level, brief, characters }) {
  const charList = characters.map((c) => `  - ${c.key}${c.name ? ` (${c.name}${c.role ? `, ${c.role}` : ''})` : ''}`).join('\n');
  const courseScope = course === 'bls'
    ? `ขอบเขต BLS เท่านั้น: ประเมิน → เรียกช่วย/โทร 1669 → CPR คุณภาพสูง → AED (shock advised/no shock) → ทำต่อจน EMS มา. ห้ามมียา ห้ามอ่าน rhythm เอง ห้ามเลือกพลังงาน defib manual (AED วิเคราะห์เอง).`
    : `ขอบเขต ACLS: อ่าน rhythm, defibrillation เลือกพลังงาน, ยา (Epi 1mg, Amiodarone 300mg ฯลฯ), H's & T's. ใช้ค่ามาตรฐาน ACLS จริงเท่านั้น.`;

  return `คุณเป็นผู้เชี่ยวชาญ ${course === 'bls' ? 'BLS' : 'ACLS'} ที่ออกแบบ "โจทย์เกมตัดสินใจกู้ชีพ" (visual novel สไตล์ Ace Attorney) สำหรับบุคลากรทางการแพทย์ชาวไทย

สร้างโจทย์ 1 เคส สำหรับโหมด "${course}" ระดับ "${level}"
${brief ? `โจทย์เพิ่มเติมจากผู้สร้าง: ${brief}` : ''}

${courseScope}

โจทย์คือลำดับ "node" ตามเวลา ผู้เล่นเป็น Team Leader ต้องเลือกคำสั่งให้ถูกในแต่ละจุดตัดสินใจ

ชนิดของ node ที่ใช้ได้:
- {"say":{"who":"<ตัวละคร>","pose":"<สีหน้า>","text":"บทพูด","fx":{...}},"t":5} — บทพูด
- {"inter":"ข้อความตะโกน!!","drama":"red","green":false,"fx":{...},"t":5} — จังหวะตะโกนเต็มจอ (green:true เมื่อเป็นข่าวดี เช่น ROSC)
- {"skip":"คำบรรยายเวลาที่ผ่านไป","t":110} — เร่งเวลา (เช่น CPR 2 นาที)
- {"choice":{"q":"คำถาม","options":[{"tgt":"<เป้าหมาย>","label":"คำสั่ง","ok":true,"then":[...node...]},{"tgt":"...","label":"...","ok":false,"why":"อธิบายว่าทำไมผิด","worsen":true}]}}
- {"end":true} — จบเคส (node สุดท้ายเสมอ)

ค่าที่อนุญาต:
- who (ตัวละคร) ใช้ได้เฉพาะ key เหล่านี้:
${charList}
- pose (สีหน้า): ${POSES.join(', ')}
- tgt (เป้าหมายคำสั่ง): ${TARGETS.join(', ')}
  (IV = เปิดเส้น/IO, CT = ส่งตรวจภาพ เช่น stroke pathway, LAB = เจาะเลือด/DTX — ใช้เฉพาะเมื่อเข้ากับเคสเท่านั้น)
- แนวทางเลือกตัวละคร: krit_airway รับบท airway/ใส่ท่อ, pae_ems ใช้เฉพาะเหตุการณ์นอกโรงพยาบาล,
  mind_runner รับบทส่ง CT/LAB, family_witness พูดได้เฉพาะให้ประวัติ/ดราม่า ห้ามยืนยันหัตถการทางคลินิก
- fx (ผลต่อผู้ป่วย ใส่เฉพาะเมื่อเกิดจริง): {"cpr":true} เริ่มกด, {"firstCPR":true} กดครั้งแรก, {"shock":true} ช็อต, {"epi":true} ให้ Epi, {"alarm":true} ยืนยัน arrest, {"rhythm":"vf"|"flat"|"nsr"}, {"rosc":true} ผู้ป่วยกลับมา

กติกาสำคัญ (ความปลอดภัยผู้ป่วยมาก่อน):
1. แต่ละ choice ต้องมี option ที่ ok:true พอดี 1 ตัว ที่เหลือ ok:false พร้อม why เสมอ
2. option ผิดที่อันตราย/ทำผู้ป่วยแย่ลง ใส่ "worsen":true
3. ลำดับเหตุการณ์สมเหตุสมผลตามเวลา (t เป็นวินาที เพิ่มขึ้น)
4. text ทั้งหมดเป็นภาษาไทยล้วน กระชับ; เน้นคำสำคัญด้วย <span class="cbs-em">คำ</span> (HTML แค่ tag นี้เท่านั้น)
5. node สุดท้ายของทางที่ถูกควรนำไปสู่ {"inter":"ROSC!!","green":true,"fx":{"rosc":true}} แล้วปิดด้วย {"end":true}
6. เคส basic 5-7 จุดตัดสินใจ, intermediate/megacode 7-10 จุด; megacode ควรมี "สาเหตุซ่อน" ที่ต้องสืบ

ตอบกลับเป็น JSON เท่านั้น ไม่มีข้อความอื่น ตามรูปแบบนี้เป๊ะ ๆ:
{"scenario":{
  "title":"ชื่อเคสสั้น",
  "subtitle":"บรรยายผู้ป่วย 1 บรรทัด",
  "level":"${level}",
  "course":"${course}",
  "hiddenCause":null,
  "story":[
    {"say":{"who":"nurse_mint","pose":"panic","text":"..."},"t":5},
    {"choice":{"q":"...","options":[{"tgt":"YOU","label":"...","ok":true,"then":[{"say":{"who":"att_dech","pose":"stern","text":"..."},"t":5}]},{"tgt":"CPR","label":"...","ok":false,"why":"...","worsen":true}]}},
    {"end":true}
  ]
}}`;
}

function extractScenario(text) {
  if (!text) return null;
  const fenced = text.match(/```json\s*([\s\S]*?)```/i) || text.match(/```\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  const first = candidate.indexOf('{');
  const last = candidate.lastIndexOf('}');
  if (first === -1 || last === -1) return null;
  try {
    const parsed = JSON.parse(candidate.slice(first, last + 1));
    return parsed.scenario || parsed;
  } catch {
    return null;
  }
}

// บังคับ shape + สร้าง warnings ให้แอดมินตรวจ (ไม่ทิ้งโจทย์ แค่เตือน)
function normalizeScenario(raw, course, level, charKeys = []) {
  const warnings = [];
  const knownChars = new Set(charKeys);
  const clampStr = (s, n) => String(s || '').trim().slice(0, n);

  let choiceCount = 0;
  let hasEnd = false;
  let hasRosc = false;

  // ตรวจ node แบบ recursive (choice.then มี node ซ้อน)
  function walk(nodes, path) {
    if (!Array.isArray(nodes)) return [];
    const out = [];
    nodes.forEach((n, i) => {
      if (!n || typeof n !== 'object') return;
      const at = `${path}[${i}]`;
      if (n.say) {
        if (knownChars.size && !knownChars.has(n.say.who)) warnings.push(`${at}: ตัวละคร "${n.say.who}" ไม่รู้จัก`);
        if (n.say.pose && !POSES.includes(n.say.pose)) warnings.push(`${at}: สีหน้า "${n.say.pose}" ไม่รู้จัก`);
        if (n.say.fx?.rosc) hasRosc = true;
        out.push({ say: sanitizeSay(n.say), ...(n.t != null ? { t: Number(n.t) || 0 } : {}) });
      } else if (n.inter) {
        if (n.fx?.rosc) hasRosc = true;
        out.push({
          inter: clampStr(n.inter, 60),
          ...(n.drama ? { drama: String(n.drama) } : {}),
          ...(n.green ? { green: true } : {}),
          ...(n.fx ? { fx: sanitizeFx(n.fx) } : {}),
          ...(n.t != null ? { t: Number(n.t) || 0 } : {}),
        });
      } else if (n.skip) {
        out.push({ skip: clampStr(n.skip, 120), t: Number(n.t) || 60 });
      } else if (n.choice) {
        choiceCount += 1;
        const opts = Array.isArray(n.choice.options) ? n.choice.options : [];
        const okCount = opts.filter((o) => o && o.ok).length;
        if (okCount !== 1) warnings.push(`${at}: choice ต้องมีคำตอบถูกพอดี 1 ข้อ (พบ ${okCount})`);
        const normOpts = opts.map((o) => {
          if (!TARGETS.includes(o.tgt)) warnings.push(`${at}: เป้าหมาย "${o.tgt}" ไม่รู้จัก`);
          if (!o.ok && !o.why) warnings.push(`${at}: option ผิดควรมี why`);
          return {
            tgt: String(o.tgt || 'YOU'),
            label: clampStr(o.label, 200),
            ok: !!o.ok,
            ...(o.why ? { why: clampStr(o.why, 300) } : {}),
            ...(o.worsen ? { worsen: true } : {}),
            ...(o.then ? { then: walk(o.then, `${at}.then`) } : {}),
          };
        });
        out.push({ choice: { q: clampStr(n.choice.q, 200), options: normOpts } });
      } else if (n.end) {
        hasEnd = true;
        out.push({ end: true });
      }
    });
    return out;
  }

  function sanitizeSay(say) {
    return {
      who: String(say.who || 'att_dech'),
      pose: POSES.includes(say.pose) ? say.pose : 'idle',
      text: clampStr(say.text, 400),
      ...(say.fx ? { fx: sanitizeFx(say.fx) } : {}),
    };
  }
  function sanitizeFx(fx) {
    const out = {};
    for (const k of ['cpr', 'firstCPR', 'shock', 'epi', 'alarm', 'rosc']) if (fx[k]) out[k] = true;
    if (['vf', 'flat', 'nsr'].includes(fx.rhythm)) out.rhythm = fx.rhythm;
    return out;
  }

  const story = walk(raw.story, 'story');
  if (choiceCount < 3) warnings.push(`มีจุดตัดสินใจแค่ ${choiceCount} จุด — น้อยเกินไป`);
  if (!hasEnd) warnings.push('ไม่มี node จบเคส (end)');
  if (!hasRosc) warnings.push('ไม่มีจังหวะ ROSC — ตรวจว่าเคสจบได้จริง');

  const scenario = {
    title: clampStr(raw.title, 120) || 'โจทย์ใหม่',
    subtitle: clampStr(raw.subtitle, 200),
    level: LEVELS.includes(raw.level) ? raw.level : level,
    course: COURSES.includes(raw.course) ? raw.course : course,
    hiddenCause: raw.hiddenCause ? clampStr(raw.hiddenCause, 60) : null,
    story,
    source: 'ai',
  };
  return { scenario, warnings };
}

function safeJson(s) {
  try { return JSON.parse(s); } catch { return {}; }
}
