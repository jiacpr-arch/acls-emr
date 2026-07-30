// Player วิดีโอบทเรียนจาก Google Drive — embed ผ่าน /preview
// Drive ไม่มี API ติดตามความคืบหน้า/seek แบบ YouTube IFrame API จึงนับ "ดูครบ"
// ตอนผู้เรียนกด "ถัดไป" ในหน้าบทเรียนแทน (ฝั่ง VideoLessonDetail เป็นคนจัดการ)
export default function DriveLessonPlayer({ fileId, orientation = 'portrait', label }) {
  const isPortrait = orientation === 'portrait';
  return (
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
  );
}
