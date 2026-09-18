// Player วิดีโอบทเรียนจาก Google Drive — embed ผ่าน /preview
// Drive ไม่มี API ติดตามความคืบหน้า/seek แบบ YouTube IFrame API จึงนับ "ดูครบ"
// ตอนผู้เรียนกด "ถัดไป" ในหน้าบทเรียนแทน (ฝั่ง VideoLessonDetail เป็นคนจัดการ)
//
// autoplay=1 เป็น param ที่ Google ไม่ได้ประกาศรองรับ — ใส่แบบ best-effort
// ถ้า Drive ไม่สนใจก็แค่ไม่เล่นเอง (ไม่พัง) และเบราว์เซอร์มือถือบล็อก autoplay
// ที่มีเสียงอยู่แล้ว จึงยังต้องมีปุ่ม play ของ Drive เป็นทางหลักเสมอ
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
        src={`https://drive.google.com/file/d/${fileId}/preview?autoplay=1`}
        title={label || 'วิดีโอบทเรียน'}
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}
