import { COURSE_MODE } from './courseMode';

// "ลีกออนไลน์" — คลาสกลางสำหรับผู้เรียนด้วยตนเองที่ไม่มีรหัสจากอาจารย์
// เป็นคลาสจริงใน cohort_classes (สร้างโดย supabase-cleanup/open-online-league.sql)
// จึงใช้ pipeline เดิมได้ทั้งหมด: บันทึกผลเกม, อันดับเหรียญ, กู้ความคืบหน้าข้ามเครื่อง
export const OPEN_LEAGUE_CODE = COURSE_MODE === 'bls' ? 'ONLINEBLS' : 'ONLINE';

export const isOpenLeague = (code) =>
  !!code && code.toUpperCase() === OPEN_LEAGUE_CODE;

// รหัสผู้เล่นสุ่ม (ใช้เป็น student_id ในลีกออนไลน์) — แทนการให้กรอกรหัสเอง
// เพราะคนแปลกหน้าหลายคนอาจกรอกเลขซ้ำกันแล้วข้อมูลชนกัน ความยาว 8 ตัวจาก
// อักษรชุดไม่กำกวม (ตัด I/L/O/0/1) → 31^8 ≈ 8.5e11 คอมโบ ชนกันยากมาก
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export function genPlayerCode() {
  const bytes = new Uint32Array(8);
  crypto.getRandomValues(bytes);
  let s = '';
  for (const b of bytes) s += CODE_ALPHABET[b % CODE_ALPHABET.length];
  return `P-${s}`;
}
