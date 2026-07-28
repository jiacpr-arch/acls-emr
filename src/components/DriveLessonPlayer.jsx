import { CheckCircle2 } from 'lucide-react';

// Player วิดีโอบทเรียนจาก Google Drive — embed ผ่าน /preview
// Drive ไม่มี API ติดตามความคืบหน้า/seek แบบ YouTube IFrame API
// จึงให้ผู้เรียนกดยืนยันเองเมื่อดูจบ (นับ "ดูครบ" เมื่อกดปุ่ม)
export default function DriveLessonPlayer({ fileId, orientation = 'portrait', watched, onWatched, label }) {
  const isPortrait = orientation === 'portrait';
  return (
    <div className="space-y-2">
      <div
        className="mx-auto w-full overflow-hidden bg-black"
        style={{
          maxWidth: isPortrait ? 340 : '100%',
          aspectRatio: isPortrait ? '9 / 16' : '16 / 9',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <iframe
          className="w-full h-full"
          src={`https://drive.google.com/file/d/${fileId}/preview`}
          title={label || 'วิดีโอบทเรียน'}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
      {!watched && (
        <button onClick={onWatched} className="btn btn-ghost btn-sm w-full text-success border border-success/30">
          <CheckCircle2 size={14} strokeWidth={2.4} /> ฉันดูคลิปนี้จบแล้ว
        </button>
      )}
    </div>
  );
}
