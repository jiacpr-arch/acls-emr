import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

// QR เข้าคลาสแบบเต็มจอ — อาจารย์ยกมือถือ/ฉายขึ้นโปรเจกเตอร์ให้นักเรียนสแกน
// ตอนเปิดคลาส พื้นขาวเสมอ (ไม่ตามธีม) เพื่อ contrast สูงสุดเวลาสแกนจากระยะไกล
export default function QrFullscreenOverlay({ joinUrl, classCode, classTitle, onClose }) {
  const [qrUrl, setQrUrl] = useState(null);

  useEffect(() => {
    if (!joinUrl) return;
    let cancelled = false;
    import('qrcode')
      .then(QR => QR.toDataURL(joinUrl, { width: 1024, margin: 2 }))
      .then(url => { if (!cancelled) setQrUrl(url); })
      .catch(() => { if (!cancelled) setQrUrl(null); });
    return () => { cancelled = true; };
  }, [joinUrl]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center gap-5 p-6"
      onClick={onClose} role="dialog" aria-label={`QR เข้าคลาส ${classCode} แบบเต็มจอ`}>
      <button onClick={onClose} aria-label="ปิด"
        className="absolute top-4 right-4 w-11 h-11 inline-flex items-center justify-center bg-gray-100 text-gray-600"
        style={{ borderRadius: '50%' }}>
        <X size={24} strokeWidth={2.2} />
      </button>

      {classTitle && (
        <div className="text-xl font-bold text-gray-800 text-center">{classTitle}</div>
      )}

      {qrUrl ? (
        <img src={qrUrl} alt={`QR เข้าคลาส ${classCode}`}
          className="w-full max-w-[70vmin]" />
      ) : (
        <div className="text-gray-400 text-sm py-24">กำลังสร้าง QR…</div>
      )}

      <div className="text-center">
        <div className="text-xs font-bold text-gray-500 tracking-widest uppercase">รหัสเข้าคลาส</div>
        <div className="text-5xl font-mono font-extrabold tracking-[0.2em] text-gray-900">
          {classCode}
        </div>
      </div>

      <div className="text-sm text-gray-500 text-center">
        สแกนด้วยกล้องมือถือเพื่อเข้าคลาส · แตะหน้าจอเพื่อปิด
      </div>
    </div>
  );
}
