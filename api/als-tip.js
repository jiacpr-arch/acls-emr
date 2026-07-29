import { enforceRateLimit } from './_lib/rateLimit.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!enforceRateLimit(req, res, { key: 'als-tip', limit: 5, windowMs: 60_000 })) return;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const { topic, course } = req.body || {};
  // course: 'bls' → เกร็ดความรู้ BLS (ใช้โดยหน้า /bls/knowledge), อื่น ๆ → ALS ตามเดิม
  const isBls = course === 'bls';
  const prompt = isBls
    ? (topic
      ? `ให้เกร็ดความรู้เกี่ยวกับ BLS (Basic Life Support / การช่วยชีวิตขั้นพื้นฐาน) ในหัวข้อ "${topic}" สำหรับบุคลากรทางการแพทย์และผู้เรียน BLS เขียนเป็นภาษาไทย กระชับ 3-5 ข้อ แต่ละข้อ 1-2 ประโยค อิงแนวทาง ILCOR ล่าสุด เนื้อหาระดับ BLS เท่านั้น (ไม่พูดถึงยาหรือหัตถการขั้นสูง)`
      : `ให้เกร็ดความรู้ BLS (Basic Life Support / การช่วยชีวิตขั้นพื้นฐาน) 1 เรื่อง สำหรับบุคลากรทางการแพทย์และผู้เรียน BLS เขียนเป็นภาษาไทย กระชับ 3-5 ข้อ แต่ละข้อ 1-2 ประโยค อิงแนวทาง ILCOR ล่าสุด เนื้อหาระดับ BLS เท่านั้น (ไม่พูดถึงยาหรือหัตถการขั้นสูง) เลือกหัวข้อแบบสุ่ม`)
    : (topic
      ? `ให้เกร็ดความรู้เกี่ยวกับ ALS (Advanced Life Support) ในหัวข้อ "${topic}" สำหรับบุคลากรทางการแพทย์ เขียนเป็นภาษาไทย กระชับ 3-5 ข้อ แต่ละข้อ 1-2 ประโยค ห้ามใช้คำว่า ACLS ให้ใช้ ALS แทน`
      : `ให้เกร็ดความรู้ ALS (Advanced Life Support) และห้องฉุกเฉิน 1 เรื่อง สำหรับบุคลากรทางการแพทย์ เขียนเป็นภาษาไทย กระชับ 3-5 ข้อ แต่ละข้อ 1-2 ประโยค ห้ามใช้คำว่า ACLS ให้ใช้ ALS แทน เลือกหัวข้อแบบสุ่ม`);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error(`als-tip: upstream ${response.status}:`, err.slice(0, 500));
      return res.status(502).json({ error: 'AI service unavailable — please try again later' });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    return res.status(200).json({ tip: text });
  } catch (err) {
    console.error('als-tip failed:', err);
    return res.status(500).json({ error: 'Failed to generate tip — please try again later' });
  }
}
