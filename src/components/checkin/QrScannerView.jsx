import { useQrScanner } from '../../hooks/useQrScanner';
import { Camera, CameraOff, ShieldAlert, Loader } from 'lucide-react';

// กล้องสแกน + กรอบเล็ง + ข้อความสถานะเมื่อกล้องใช้ไม่ได้
export default function QrScannerView({ enabled, onDecode }) {
  const { videoRef, status } = useQrScanner({ onDecode, enabled });

  return (
    <div className="dash-card !p-0 overflow-hidden relative aspect-square bg-black"
      style={{ borderRadius: 'var(--radius-lg)' }}>
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* กรอบเล็งมุมสี่ด้าน */}
      {status === 'scanning' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-3/5 aspect-square relative">
            {['top-0 left-0 border-t-4 border-l-4', 'top-0 right-0 border-t-4 border-r-4',
              'bottom-0 left-0 border-b-4 border-l-4', 'bottom-0 right-0 border-b-4 border-r-4',
            ].map(pos => (
              <div key={pos} className={`absolute w-8 h-8 border-white/90 ${pos}`}
                style={{ borderRadius: '4px' }} />
            ))}
          </div>
        </div>
      )}

      {status !== 'scanning' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-6 bg-black/70 text-white">
          {(status === 'idle' || status === 'starting') && (
            <>
              <Loader size={28} strokeWidth={2} className="animate-spin opacity-80" />
              <div className="text-caption opacity-90">กำลังเปิดกล้อง…</div>
            </>
          )}
          {status === 'denied' && (
            <>
              <CameraOff size={28} strokeWidth={2} />
              <div className="text-caption">
                ไม่ได้รับอนุญาตให้ใช้กล้อง —
                เปิดสิทธิ์กล้องของเว็บนี้ใน Settings ของเบราว์เซอร์
                (iPhone: ตั้งค่า &gt; Safari &gt; กล้อง) แล้วโหลดหน้านี้ใหม่
              </div>
            </>
          )}
          {status === 'no-camera' && (
            <>
              <Camera size={28} strokeWidth={2} />
              <div className="text-caption">
                ไม่พบกล้องบนเครื่องนี้ — ใช้แท็บ "รายชื่อ" เช็คชื่อแทนได้
              </div>
            </>
          )}
          {status === 'insecure' && (
            <>
              <ShieldAlert size={28} strokeWidth={2} />
              <div className="text-caption">
                เบราว์เซอร์ปิดการใช้กล้องบนหน้า http:// —
                ต้องเปิดผ่าน https:// (เว็บจริง) หรือ localhost เท่านั้น
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
