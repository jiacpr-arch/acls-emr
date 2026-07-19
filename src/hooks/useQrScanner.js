import { useEffect, useRef, useState } from 'react';

// กล้องสแกน QR สำหรับหน้าเช็คชื่ออาจารย์
// - Android Chrome: ใช้ native BarcodeDetector (เร็ว ตรวจทุกเฟรม)
// - iPhone Safari: ไม่มี BarcodeDetector → fallback เป็น jsqr วาดเฟรมลง canvas
//   (dynamic import ให้ jsqr อยู่นอก main chunk เหมือน qrcode ใน InstructorCohort)
// - getUserMedia ใช้ได้เฉพาะ secure context (HTTPS/localhost) → สถานะ 'insecure'
// - QR ที่จ่อค้างไว้จะ decode ได้ทุกเฟรม → กันยิงซ้ำ payload เดิมภายใน 3 วิ
//
// คืน { videoRef, status, error }
//   status: 'idle' | 'starting' | 'scanning' | 'denied' | 'no-camera' | 'insecure'
export function useQrScanner({ onDecode, enabled = true }) {
  const videoRef = useRef(null);
  const onDecodeRef = useRef(onDecode);
  onDecodeRef.current = onDecode;
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled) {
      setStatus('idle');
      return undefined;
    }
    let cancelled = false;
    const videoEl = videoRef.current; // capture — cleanup ต้องชี้ element ตัวเดิม
    let stream = null;
    let rafId = null;
    let detector = null;
    let jsqrFn = null;
    let canvas = null;
    let ctx = null;
    let lastDecodeAttempt = 0;
    let lastText = null;
    let lastTextAt = 0;

    const emit = (text) => {
      const now = Date.now();
      if (text === lastText && now - lastTextAt < 3000) return;
      lastText = text;
      lastTextAt = now;
      onDecodeRef.current?.(text);
    };

    const scanFrame = async () => {
      if (cancelled) return;
      const video = videoRef.current;
      if (video && video.readyState >= 2) {
        try {
          if (detector) {
            const codes = await detector.detect(video);
            if (!cancelled && codes.length > 0 && codes[0].rawValue) {
              emit(codes[0].rawValue);
            }
          } else if (jsqrFn) {
            // jsqr แพงกว่า native มาก — จำกัด ~7 fps + ย่อภาพเหลือกว้าง 480px
            const now = Date.now();
            if (now - lastDecodeAttempt >= 140) {
              lastDecodeAttempt = now;
              const w = 480;
              const h = Math.round((video.videoHeight / video.videoWidth) * w) || 360;
              if (!canvas) {
                canvas = document.createElement('canvas');
                ctx = canvas.getContext('2d', { willReadFrequently: true });
              }
              canvas.width = w;
              canvas.height = h;
              ctx.drawImage(video, 0, 0, w, h);
              const imageData = ctx.getImageData(0, 0, w, h);
              const code = jsqrFn(imageData.data, w, h, { inversionAttempts: 'dontInvert' });
              if (!cancelled && code?.data) emit(code.data);
            }
          }
        } catch {
          // เฟรมเสีย/detector สะดุด — ข้ามไปเฟรมถัดไป
        }
      }
      if (!cancelled) rafId = requestAnimationFrame(scanFrame);
    };

    const start = async () => {
      setError(null);
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus(window.isSecureContext === false ? 'insecure' : 'no-camera');
        return;
      }
      setStatus('starting');
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 } },
          audio: false,
        });
      } catch (err) {
        if (cancelled) return;
        setError(err);
        setStatus(err?.name === 'NotAllowedError' ? 'denied' : 'no-camera');
        return;
      }
      if (cancelled) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      try { await video.play(); } catch { /* iOS อาจ reject ตอน unmount เร็ว */ }
      if (cancelled) return;

      if ('BarcodeDetector' in window) {
        try {
          const formats = await window.BarcodeDetector.getSupportedFormats();
          if (formats.includes('qr_code')) {
            detector = new window.BarcodeDetector({ formats: ['qr_code'] });
          }
        } catch { detector = null; }
      }
      if (!detector) {
        const mod = await import('jsqr');
        jsqrFn = mod.default;
      }
      if (cancelled) return;
      setStatus('scanning');
      rafId = requestAnimationFrame(scanFrame);
    };

    start();

    // iOS ตัด stream เองเมื่อสลับแอป/แท็บ — กลับมาแล้วต้อง restart กล้อง
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && !cancelled
          && stream && stream.getVideoTracks().every((t) => t.readyState === 'ended')) {
        stream.getTracks().forEach((t) => t.stop());
        start();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibility);
      if (rafId) cancelAnimationFrame(rafId);
      if (stream) stream.getTracks().forEach((t) => t.stop());
      if (videoEl) videoEl.srcObject = null;
    };
  }, [enabled]);

  return { videoRef, status, error };
}
