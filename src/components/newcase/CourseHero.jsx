import StreakBadge from '../StreakBadge';

// Hero หน้าแรกชุด "Monitor": บรรทัด meta ตัว mono → ชื่อคอร์สตัวใหญ่ →
// ชื่อเต็ม แล้วปิดด้วยเส้น ECG สีประจำคอร์ส (--color-accent) ข้ามจอ
// ป้าย Clinical/Training ยังเป็นสีความหมาย (danger/info) ไม่ผูกกับสีคอร์ส
export default function CourseHero({
  isClinical,
  eyebrow = 'Advanced Cardiac Life Support',
  title = 'ACLS EMR',
  meta = 'ILCOR 2025 · Code Blue Recording',
}) {
  return (
    <div style={{ marginTop: 8 }}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-overline truncate">{meta}</span>
        <span className="flex items-center gap-1.5 shrink-0">
          <StreakBadge compact />
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 font-mono text-2xs font-semibold uppercase ${
              isClinical ? 'bg-danger/10 text-danger' : 'bg-info/10 text-info'
            }`}
            style={{ borderRadius: 99, letterSpacing: '0.06em' }}
          >
            <span
              className={`w-1.5 h-1.5 ${isClinical ? 'bg-danger animate-pulse' : 'bg-info'}`}
              style={{ borderRadius: 99 }}
            />
            {isClinical ? 'Clinical' : 'Training'}
          </span>
        </span>
      </div>
      <h1 className="text-display text-text-primary" style={{ marginTop: 4 }}>{title}</h1>
      <div className="text-caption text-text-muted">{eyebrow}</div>
      <svg className="home-ecg" viewBox="0 0 390 36" preserveAspectRatio="none" fill="none" aria-hidden="true" style={{ marginTop: 6 }}>
        <path d="M0 22 H150 l6 -3 l5 3 h10 l4 -16 l6 28 l4 -12 h14 l8 -5 l8 5 H390"
          stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}
