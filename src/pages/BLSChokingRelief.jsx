import { Wind, Users, Baby, AlertTriangle, Construction } from 'lucide-react';
import MorrooAdCard from '../components/MorrooAdCard';

const sections = [
  {
    id: 'adult',
    Icon: Users,
    title: 'ผู้ใหญ่ / เด็กโต — รู้ตัว',
    color: 'info',
    bullets: [
      'ถามว่า "สำลักไหม?" — ถ้าไอแรงๆ ได้ ให้รอ',
      'ไอไม่ออก / พูดไม่ได้ → ทำ Abdominal Thrusts (Heimlich)',
      'ยืนด้านหลัง → กำมือใต้สะดือ → กระตุกเข้าและขึ้น',
      'ทำซ้ำจนวัตถุหลุด หรือผู้ป่วยหมดสติ',
    ],
  },
  {
    id: 'infant',
    Icon: Baby,
    title: 'ทารก < 1 ปี — รู้ตัว',
    color: 'warning',
    bullets: [
      'คว่ำหน้าบนแขน หัวต่ำกว่าตัว → ตบหลัง 5 ครั้ง (Back Blows)',
      'พลิกหงาย → กด Chest Thrusts 5 ครั้ง (จุดเดียวกับ CPR)',
      'สลับ Back Blows / Chest Thrusts จนวัตถุหลุด',
      'ห้ามทำ Abdominal Thrusts ในทารก',
    ],
  },
  {
    id: 'unconscious',
    Icon: AlertTriangle,
    title: 'หมดสติ',
    color: 'danger',
    bullets: [
      'วางผู้ป่วยลงพื้น → เรียก EMS ทันที',
      'เริ่ม CPR (30:2) — ก่อนเป่าให้ดูในปาก',
      'เห็นวัตถุ → เอาออก (ห้าม blind finger sweep)',
      'CPR ต่อจนทีมช่วยเหลือมาถึง',
    ],
  },
];

const colorClass = {
  info: 'bg-info/15 text-info',
  warning: 'bg-warning/15 text-warning',
  danger: 'bg-danger/15 text-danger',
};

const bulletClass = {
  info: 'text-info',
  warning: 'text-warning',
  danger: 'text-danger',
};

export default function BLSChokingRelief() {
  return (
    <div className="page-container space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 inline-flex items-center justify-center bg-info/15 text-info"
          style={{ borderRadius: 'var(--radius-md)' }}>
          <Wind size={22} strokeWidth={2.2} />
        </div>
        <div>
          <h1 className="text-title text-text-primary">ช่วยเหลือคนสำลัก</h1>
          <p className="text-caption text-text-muted">Choking Relief — Foreign-Body Airway Obstruction</p>
        </div>
      </div>

      <MorrooAdCard />

      <div className="dash-card !p-3 flex items-start gap-2 bg-warning/10 border border-warning/30">
        <Construction size={16} strokeWidth={2.4} className="text-warning shrink-0 mt-0.5" />
        <span className="text-caption text-text-secondary">
          หน้านี้กำลังพัฒนา — เนื้อหาแบบเต็ม (รูป + วิดีโอ demo) จะเพิ่มในเร็วๆ นี้
        </span>
      </div>

      <div className="space-y-3">
        {sections.map(s => {
          const SIcon = s.Icon;
          return (
            <div key={s.id} className="dash-card space-y-2">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 inline-flex items-center justify-center shrink-0 ${colorClass[s.color]}`}
                  style={{ borderRadius: 'var(--radius-sm)' }}>
                  <SIcon size={18} strokeWidth={2.2} />
                </div>
                <div className="text-headline text-text-primary">{s.title}</div>
              </div>
              <ul className="space-y-1 pl-2">
                {s.bullets.map((b, i) => (
                  <li key={i} className="text-caption text-text-secondary flex gap-2">
                    <span className={`shrink-0 ${bulletClass[s.color]}`}>•</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
