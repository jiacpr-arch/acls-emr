import { Lock } from 'lucide-react';
import LessonVideos from './precourse/LessonVideos';

// กล่องวิดีโอประจำขั้นตอน — ล็อกไว้จนกว่าจะดูวิดีโอขั้นก่อนหน้า (เนื้อหาข้อความไม่ล็อก มีแค่กล่องนี้)
export default function StepVideoBox({
  videos,
  locked,
  lockHint = 'ดูวิดีโอขั้นก่อนหน้าเพื่อปลดล็อก',
  title = 'วิดีโอสาธิตขั้นนี้',
  onOpened,
}) {
  const items = (videos || []).filter(v => v.url);
  if (!items.length) return null;

  if (locked) {
    return (
      <div className="dash-card !p-3 flex items-center gap-2.5 opacity-60">
        <Lock size={15} strokeWidth={2.2} className="text-text-muted shrink-0" />
        <span className="text-caption text-text-muted">{lockHint}</span>
      </div>
    );
  }

  return <LessonVideos videos={items} title={title} onPlay={onOpened} />;
}
