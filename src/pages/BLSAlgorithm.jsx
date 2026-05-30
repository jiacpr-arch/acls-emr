import { Link } from 'react-router-dom';
import { GitBranch, HeartPulse, Baby, Users, ChevronRight, Construction } from 'lucide-react';
import MorrooAdCard from '../components/MorrooAdCard';

const variants = [
  {
    id: 'adult',
    Icon: Users,
    title: 'Adult BLS',
    subtitle: 'ผู้ใหญ่ (≥ 8 ปี) — Single & 2-rescuer',
    bullets: [
      'ประเมินที่เกิดเหตุ + เรียกขอความช่วยเหลือ',
      'CPR 30:2 (single) หรือ 30:2 / 15:2 (2-rescuer ตามอายุ)',
      'AED มาถึง → ใช้ทันที',
    ],
  },
  {
    id: 'pediatric',
    Icon: HeartPulse,
    title: 'Pediatric BLS',
    subtitle: 'เด็ก (1 ปี – วัยรุ่น)',
    bullets: [
      'อัตราส่วน 30:2 (1 ผู้ช่วยเหลือ) / 15:2 (≥ 2 ผู้ช่วยเหลือ)',
      'ความลึก compression ≈ 1/3 ของหน้าอก (~5 ซม.)',
      'AED: ใช้ pediatric pads ถ้ามี (ถ้าไม่มีใช้ผู้ใหญ่)',
    ],
  },
  {
    id: 'infant',
    Icon: Baby,
    title: 'Infant BLS',
    subtitle: 'ทารก (< 1 ปี)',
    bullets: [
      '2-finger technique (1 rescuer) หรือ 2-thumb encircling (2 rescuer)',
      'ความลึก ≈ 4 ซม. (1/3 ของหน้าอก)',
      'อัตราส่วน 30:2 / 15:2',
    ],
  },
];

export default function BLSAlgorithm() {
  return (
    <div className="page-container space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 inline-flex items-center justify-center bg-info/15 text-info"
          style={{ borderRadius: 'var(--radius-md)' }}>
          <GitBranch size={22} strokeWidth={2.2} />
        </div>
        <div>
          <h1 className="text-title text-text-primary">BLS Algorithm</h1>
          <p className="text-caption text-text-muted">ขั้นตอนช่วยชีวิตตาม ILCOR 2025</p>
        </div>
      </div>

      <MorrooAdCard />

      <div className="dash-card !p-3 flex items-start gap-2 bg-warning/10 border border-warning/30">
        <Construction size={16} strokeWidth={2.4} className="text-warning shrink-0 mt-0.5" />
        <span className="text-caption text-text-secondary">
          หน้านี้กำลังพัฒนา — เนื้อหา algorithm แบบเต็ม (รูป flowchart + รายละเอียดแต่ละขั้น) จะเพิ่มในเร็วๆ นี้
        </span>
      </div>

      <div className="space-y-3">
        {variants.map(v => {
          const VIcon = v.Icon;
          return (
            <div key={v.id} className="dash-card space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 inline-flex items-center justify-center bg-info/15 text-info shrink-0"
                  style={{ borderRadius: 'var(--radius-sm)' }}>
                  <VIcon size={18} strokeWidth={2.2} />
                </div>
                <div>
                  <div className="text-headline text-text-primary">{v.title}</div>
                  <div className="text-caption text-text-muted">{v.subtitle}</div>
                </div>
              </div>
              <ul className="space-y-1 pl-2">
                {v.bullets.map((b, i) => (
                  <li key={i} className="text-caption text-text-secondary flex gap-2">
                    <span className="text-info shrink-0">•</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <Link to="/skill-practice" className="dash-card !p-3 flex items-center gap-3 hover:border-info/40 border border-border">
        <div className="w-9 h-9 inline-flex items-center justify-center bg-success/15 text-success"
          style={{ borderRadius: 'var(--radius-sm)' }}>
          <HeartPulse size={16} strokeWidth={2.2} />
        </div>
        <div className="flex-1">
          <div className="text-caption font-semibold text-text-primary">ฝึก CPR Metronome</div>
          <div className="text-[11px] text-text-muted">ฝึก compression rate 100–120/นาที</div>
        </div>
        <ChevronRight size={16} strokeWidth={2.2} className="text-text-muted" />
      </Link>
    </div>
  );
}
