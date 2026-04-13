export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const { topic } = req.body || {};
  const prompt = topic
    ? `ให้เกร็ดความรู้เกี่ยวกับ ALS (Advanced Life Support) ในหัวข้อ "${topic}" สำหรับบุคลากรทางการแพทย์ เขียนเป็นภาษาไทย กระชับ 3-5 ข้อ แต่ละข้อ 1-2 ประโยค ห้ามใช้คำว่า ACLS ให้ใช้ ALS แทน`
    : `ให้เกร็ดความรู้ ALS (Advanced Life Support) และห้องฉุกเฉิน 1 เรื่อง สำหรับบุคลากรทางการแพทย์ เขียนเป็นภาษาไทย กระชับ 3-5 ข้อ แต่ละข้อ 1-2 ประโยค ห้ามใช้คำว่า ACLS ให้ใช้ ALS แทน เลือกหัวข้อแบบสุ่ม`;

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
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    return res.status(200).json({ tip: text });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
