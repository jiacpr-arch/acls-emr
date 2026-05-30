import { Zap, Power, Shield, Construction } from 'lucide-react';
import MorrooAdCard from '../components/MorrooAdCard';

const steps = [
  {
    n: 1,
    title: 'เปิดเครื่อง AED',
    detail: 'กดปุ่ม Power หรือเปิดฝา — ทำตามเสียงที่เครื่องบอกตลอด',
  },
  {
    n: 2,
    title: 'ติดแผ่น Pads',
    detail: 'แผ่นขวาบน (ใต้กระดูกไหปลาร้า) + แผ่นซ้ายล่าง (ใต้รักแร้) — ทารก: ติดหน้า-หลัง',
  },
  {
    n: 3,
    title: 'เคลียร์ — ห้ามแตะผู้ป่วย',
    detail: 'เครื่องกำลัง analyze จังหวะหัวใจ — ให้ทุกคนถอยห่าง',
  },
  {
    n: 4,
    title: 'กดปุ่ม Shock (ถ้าเครื่องสั่ง)',
    detail: 'เคลียร์อีกครั้ง → กด Shock → CPR ต่อทันที 2 นาที',
  },
  {
    n: 5,
    title: 'CPR ต่อ → วิเคราะห์ซ้ำ',
    detail: 'AED จะ analyze ทุก 2 นาที — ทำซ้ำจนกว่าทีม ALS มาถึง',
  },
];

export default function BLSAedGuide() {
  return (
    <div className="page-container space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 inline-flex items-center justify-center bg-warning/15 text-warning"
          style={{ borderRadius: 'var(--radius-md)' }}>
          <Zap size={22} strokeWidth={2.2} />
        </div>
        <div>
          <h1 className="text-title text-text-primary">การใช้ AED</h1>
          <p className="text-caption text-text-muted">Automated External Defibrillator — 5 ขั้นตอน</p>
        </div>
      </div>

      <MorrooAdCard />

      <div className="dash-card !p-3 flex items-start gap-2 bg-warning/10 border border-warning/30">
        <Construction size={16} strokeWidth={2.4} className="text-warning shrink-0 mt-0.5" />
        <span className="text-caption text-text-secondary">
          หน้านี้กำลังพัฒนา — เนื้อหาแบบเต็ม (รูปประกอบ + วิดีโอ) จะเพิ่มในเร็วๆ นี้
        </span>
      </div>

      <div className="space-y-3">
        {steps.map(s => (
          <div key={s.n} className="dash-card !p-3 flex items-start gap-3">
            <div className="w-9 h-9 inline-flex items-center justify-center bg-warning/15 text-warning shrink-0 text-numeric"
              style={{ borderRadius: 'var(--radius-full)' }}>
              {s.n}
            </div>
            <div className="flex-1">
              <div className="text-caption font-semibold text-text-primary">{s.title}</div>
              <div className="text-[12px] text-text-secondary mt-0.5">{s.detail}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="dash-card !p-4 bg-info/10 border border-info/30 space-y-2">
        <div className="flex items-center gap-2 text-info">
          <Shield size={16} strokeWidth={2.4} />
          <span className="text-caption font-bold">ข้อควรระวัง</span>
        </div>
        <ul className="space-y-1 text-caption text-text-secondary pl-2">
          <li className="flex gap-2"><span className="text-info">•</span><span>หน้าอกเปียก → เช็ดให้แห้งก่อน</span></li>
          <li className="flex gap-2"><span className="text-info">•</span><span>มีแผ่นยา/เครื่องกระตุ้นหัวใจ → ติดห่าง ≥ 1 นิ้ว</span></li>
          <li className="flex gap-2"><span className="text-info">•</span><span>ขนหน้าอกหนา → โกนหรือใช้แผ่นสำรอง</span></li>
        </ul>
      </div>
    </div>
  );
}
