// ดึงคำบรรยาย (captions) ของคลิป YouTube มาเป็นข้อความ เพื่อให้ AI "อ่านเนื้อหาคลิปจริง"
// วิธี: โหลดหน้า watch → แกะ captionTracks จาก ytInitialPlayerResponse → โหลด transcript (fmt=json3)
// ไม่ใช้ API key; ใช้ได้กับคลิปที่มีคำบรรยาย (รวม auto-generated) — คลิปที่ปิดคำบรรยายจะคืน null
// หมายเหตุ: YouTube อาจบล็อก IP ของ datacenter เป็นครั้งคราว จึงต้อง fallback ฝั่งเรียกใช้เสมอ

const FETCH_TIMEOUT_MS = 15000;
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

// เลือก track ที่เหมาะสุด: ไทยก่อน → อังกฤษ → อันแรก; ภาษาเดียวกันเลือกคนพิมพ์เอง (ไม่ใช่ asr) ก่อน
export function pickCaptionTrack(tracks) {
  if (!Array.isArray(tracks) || tracks.length === 0) return null;
  const byLang = (prefix) => {
    const matches = tracks.filter(t => (t.languageCode || '').toLowerCase().startsWith(prefix));
    if (!matches.length) return null;
    return matches.find(t => t.kind !== 'asr') || matches[0];
  };
  return byLang('th') || byLang('en') || tracks.find(t => t.kind !== 'asr') || tracks[0];
}

// json3 events → ข้อความล้วน; ตัดช่วงเวลาตาม startSec/endSec (เผื่อ ±3 วิ) ถ้าคลิปถูกตัดช่วง
export function json3ToText(data, { startSec = null, endSec = null } = {}) {
  const events = Array.isArray(data?.events) ? data.events : [];
  const lines = [];
  for (const ev of events) {
    if (!Array.isArray(ev.segs)) continue;
    const t = (ev.tStartMs ?? 0) / 1000;
    if (startSec != null && t < startSec - 3) continue;
    if (endSec != null && t > endSec + 3) continue;
    const text = ev.segs.map(s => s.utf8 || '').join('').replace(/\s+/g, ' ').trim();
    if (text) lines.push(text);
  }
  return lines.join('\n');
}

// แกะ array captionTracks จาก HTML ของหน้า watch
export function extractCaptionTracks(html) {
  const m = (html || '').match(/"captionTracks":(\[.*?\])(?=,\s*")/);
  if (!m) return null;
  try { return JSON.parse(m[1]); } catch { return null; }
}

async function fetchWithTimeout(url, headers) {
  return fetch(url, { headers, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
}

/**
 * คืน { text, language, auto } หรือ null ถ้าคลิปไม่มีคำบรรยาย/ดึงไม่สำเร็จ
 * ห้าม throw — ผู้เรียกใช้ควร fallback ไปโหมด metadata ได้เสมอ
 */
export async function fetchYouTubeTranscript(videoId, { startSec = null, endSec = null } = {}) {
  if (!/^[\w-]{11}$/.test(videoId || '')) return null;
  try {
    const headers = { 'User-Agent': USER_AGENT, 'Accept-Language': 'th,en;q=0.8' };
    const watchRes = await fetchWithTimeout(`https://www.youtube.com/watch?v=${videoId}`, headers);
    if (!watchRes.ok) return null;
    const html = await watchRes.text();

    const tracks = extractCaptionTracks(html);
    const track = pickCaptionTrack(tracks);
    if (!track?.baseUrl) return null;

    const sep = track.baseUrl.includes('?') ? '&' : '?';
    const capRes = await fetchWithTimeout(`${track.baseUrl}${sep}fmt=json3`, headers);
    if (!capRes.ok) return null;
    const data = await capRes.json();

    const text = json3ToText(data, { startSec, endSec });
    if (!text.trim()) return null;
    return { text, language: track.languageCode || '', auto: track.kind === 'asr' };
  } catch (err) {
    console.error('fetchYouTubeTranscript failed:', err?.message || err);
    return null;
  }
}
