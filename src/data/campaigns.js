// ลิงก์สั้นสำหรับโพสต์โซเชียล — <โดเมน>/go/<slug>
//
// ใช้ในคอมเมนต์แรกของ Reel / ลิงก์ในไบโอ / ข้อความ auto-DM: สั้นพอให้คนพิมพ์
// ตามได้เอง (IG กดลิงก์ในคอมเมนต์ไม่ได้) แล้วหน้า /go จะแนบ utm_* ให้เอง
// ก่อนเด้งไปหน้าปลายทาง — analytics.js เก็บ attribution ต่อเข้า PostHog + Meta Pixel
//
// เพิ่มลิงก์ใหม่: ใส่ key ลงตารางนี้
// slug ที่ไม่มีในตารางก็ยังใช้งานได้ — จะพาไป /sim และใช้ slug เป็น utm_content
// เพื่อให้ตั้งลิงก์ต่อคลิปใหม่ได้โดยไม่ต้องแก้โค้ด เช่น /go/vf-arrest-01

export const DEFAULT_TARGET = '/sim';

// a-z 0-9 และ - เท่านั้น กันขยะ/ค่ามั่วหลุดเข้า analytics
const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{0,47}$/;

export const campaigns = {
  // Reel / คลิปสั้น
  reel: { to: '/sim', source: 'ig', medium: 'reel', campaign: 'codeblue' },
  fbreel: { to: '/sim', source: 'fb', medium: 'reel', campaign: 'codeblue' },
  tiktok: { to: '/sim', source: 'tiktok', medium: 'reel', campaign: 'codeblue' },
  // ลิงก์ในไบโอ + ข้อความตอบอัตโนมัติทาง DM
  bio: { to: '/sim', source: 'ig', medium: 'bio', campaign: 'profile' },
  dm: { to: '/sim', source: 'ig', medium: 'dm', campaign: 'autoreply' },
  line: { to: '/sim', source: 'line', medium: 'chat', campaign: 'broadcast' },
  // ปลายทางอื่นที่โพสต์บ่อย
  board: { to: '/sim-board', source: 'ig', medium: 'reel', campaign: 'leaderboard' },
  learn: { to: '/pre-course', source: 'ig', medium: 'reel', campaign: 'precourse' },
};

function clean(value) {
  const slug = String(value || '').toLowerCase();
  return SLUG_PATTERN.test(slug) ? slug : '';
}

/**
 * แปลง slug + ?c=<variant> เป็นปลายทางพร้อม utm_*
 * @param {string} slug ค่าจาก /go/:campaign
 * @param {string} [content] ค่าจาก ?c= — ใช้แยกว่าคลิปไหนพาคนมา (ทับ utm_content เดิม)
 * @returns {{ to: string, utm: object, target: string, known: boolean }}
 */
export function resolveCampaign(slug, content) {
  const key = clean(slug);
  const entry = campaigns[key];
  const variant = clean(content);

  const utm = {
    utm_source: entry?.source || 'shortlink',
    utm_medium: entry?.medium || 'social',
    utm_campaign: entry?.campaign || 'shortlink',
  };
  // ไม่รู้จัก slug → เก็บ slug ไว้เป็น utm_content จะได้ยังแยกที่มาได้อยู่
  const utmContent = variant || (entry ? '' : key);
  if (utmContent) utm.utm_content = utmContent;

  const to = entry?.to || DEFAULT_TARGET;
  return {
    to,
    utm,
    target: `${to}?${new URLSearchParams(utm)}`,
    known: Boolean(entry),
  };
}
