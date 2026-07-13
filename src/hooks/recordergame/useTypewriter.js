import { useState, useRef, useEffect, useCallback } from 'react';

// ==========================================
// Recorder Hero — พิมพ์ดีดบทพูดสไตล์ AA (พอร์ตจาก CodeBlueSim typeText)
// พิมพ์ทีละตัว ข้าม HTML tag; แตะ = จบทันที
// เป็น cosmetic ล้วน — ไม่ยุ่งกับ engine clock/คะแนน
// ==========================================
export function useTypewriter(text, { reducedMotion = false, speed = 16 } = {}) {
  const [html, setHtml] = useState('');
  const [typing, setTyping] = useState(false);
  const timerRef = useRef(null);
  const fullRef = useRef('');

  const skip = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    setHtml(fullRef.current);
    setTyping(false);
  }, []);

  useEffect(() => {
    const full = text || '';
    fullRef.current = full;
    let i = 0;
    let out = '';
    let cancelled = false;

    // ตรรกะทั้งหมดอยู่ใน callback ของ timeout (ไม่ setState ตรงๆ ใน effect body)
    const step = () => {
      if (cancelled) return;
      if (i === 0) setTyping(true);
      if (reducedMotion || !full) {
        setHtml(full);
        setTyping(false);
        return;
      }
      if (i >= full.length) { setTyping(false); return; }
      const ch = full[i];
      if (ch === '<') {
        const close = full.indexOf('>', i);
        out += full.slice(i, close + 1);
        i = close + 1;
      } else {
        out += ch;
        i += 1;
      }
      setHtml(out);
      timerRef.current = setTimeout(step, speed);
    };
    timerRef.current = setTimeout(step, 0);

    return () => { cancelled = true; if (timerRef.current) clearTimeout(timerRef.current); };
  }, [text, reducedMotion, speed]);

  return { html, typing, skip };
}
