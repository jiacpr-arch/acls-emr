// แยก YouTube video id จากลิงก์ — รองรับ youtu.be/, watch?v=, embed/ และ shorts/ (วิดีโอแนวตั้ง)
export function getYouTubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  return m ? m[1] : null;
}
