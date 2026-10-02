// ==========================================
// Web Speech API — อ่านบทพูดออกเสียง (TTS) ด้วยเสียงไทยจากตัวเครื่องผู้เล่น
// ไม่ต้องมีไฟล์เสียง — เสียงที่ได้ต่างกันตามอุปกรณ์ (Android = Google TTS,
// iOS = เสียงระบบเช่น Kanya); เครื่องที่ไม่มีเสียงไทยจะ fallback เป็นเสียง default
// ==========================================

const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;

export function isSpeechSupported() {
  return !!synth && typeof SpeechSynthesisUtterance !== 'undefined';
}

// เสียงไทยโหลดแบบ async (event voiceschanged) — cache ไว้และอัปเดตเมื่อรายการเปลี่ยน
let thaiVoice = null;
let voicesHooked = false;
function resolveThaiVoice() {
  if (!synth) return;
  const voices = synth.getVoices() || [];
  thaiVoice = voices.find(v => /^th([-_]|$)/i.test(v.lang || '')) || null;
}
function ensureVoiceHook() {
  if (voicesHooked || !synth) return;
  voicesHooked = true;
  resolveThaiVoice();
  synth.addEventListener?.('voiceschanged', resolveThaiVoice);
}

// iOS Safari ต้องเรียก speak ครั้งแรกภายใน user gesture — พูด utterance ว่าง
// เพื่อปลดล็อกตอนผู้เล่นแตะปุ่มเริ่มเกม แล้วครั้งถัดไปพูดจาก timer ได้
let primed = false;
export function primeSpeech() {
  if (primed || !isSpeechSupported()) return;
  primed = true;
  ensureVoiceHook();
  try {
    const u = new SpeechSynthesisUtterance(' ');
    u.volume = 0;
    synth.speak(u);
  } catch { /* speech ไม่พร้อมบนเครื่องนี้ */ }
}

// ตัด HTML tag / สัญลักษณ์ลูกศร ก่อนส่งให้ TTS (เคสจาก DB อาจมี markup ปน)
function toSpeakable(text) {
  return String(text || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/[→←↑↓]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function speakThai(text, { rate = 1, pitch = 1 } = {}) {
  if (!isSpeechSupported()) return;
  const clean = toSpeakable(text);
  if (!clean) return;
  ensureVoiceHook();
  try {
    synth.cancel(); // บทพูดใหม่สำคัญกว่าเสมอ — ตัดประโยคก่อนหน้าทิ้ง
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = 'th-TH';
    // ถ้า set voice ไม่ได้ (เบราว์เซอร์เพี้ยน) ยังพูดต่อด้วยเสียง default ตาม u.lang
    try { if (thaiVoice) u.voice = thaiVoice; } catch { /* ใช้เสียง default */ }
    u.rate = rate;
    u.pitch = pitch;
    // Chrome บางเวอร์ชันกลืน utterance ที่ speak ทันทีหลัง cancel — เว้นหนึ่ง tick
    setTimeout(() => { try { synth.speak(u); } catch { /* noop */ } }, 0);
  } catch { /* speech ไม่พร้อมบนเครื่องนี้ */ }
}

export function stopSpeech() {
  if (!synth) return;
  try { synth.cancel(); } catch { /* noop */ }
}

// เปิด/ปิดเสียงพูดของเกม Recorder (จำข้ามรอบใน localStorage) — default เปิด
const VOICE_PREF_KEY = 'acls_recgame_voice';
export function loadVoicePref() {
  try { return localStorage.getItem(VOICE_PREF_KEY) !== '0'; } catch { return true; }
}
export function saveVoicePref(on) {
  try { localStorage.setItem(VOICE_PREF_KEY, on ? '1' : '0'); } catch { /* storage เต็ม/ปิดใช้ */ }
}
