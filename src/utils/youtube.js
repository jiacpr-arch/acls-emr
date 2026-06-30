// แยก YouTube video id จากลิงก์ — รองรับ youtu.be/, watch?v=, embed/ และ shorts/ (วิดีโอแนวตั้ง)
export function getYouTubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  return m ? m[1] : null;
}

// แยกเวลาเริ่ม (วินาที) จาก ?t= / &t= / &start= — รองรับทั้ง "90" และ "1m30s"
export function parseStartSeconds(url) {
  if (!url) return null;
  const m = url.match(/[?&](?:t|start)=([\dhms]+)/i);
  if (!m) return null;
  const v = m[1];
  if (/^\d+$/.test(v)) return Number(v);
  const hms = v.match(/(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/i);
  if (!hms) return null;
  return (Number(hms[1] || 0) * 3600) + (Number(hms[2] || 0) * 60) + Number(hms[3] || 0);
}

// วินาที → "m:ss" หรือ "h:mm:ss" สำหรับแสดงสารบัญช่วงเวลา
export function formatClipTime(totalSec) {
  const s = Math.max(0, Math.floor(Number(totalSec) || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = h ? String(m).padStart(2, '0') : String(m);
  return `${h ? `${h}:` : ''}${mm}:${String(sec).padStart(2, '0')}`;
}
