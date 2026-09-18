import { useNavigate } from 'react-router-dom';
import { HeartPulse, Activity, Zap, Wind } from 'lucide-react';

// 2x2 quick-start grid สำหรับหน้าแรก BLS — โครงเดียวกับ ACLSQuickActions
// (การ์ดขาว + ไอคอนสีประจำหมวด) แต่ปลายทางเป็นทางลัด BLS: เริ่มบันทึก CPR,
// ฝึก metronome, คู่มือ AED, คู่มือสำลัก. สีต่อรายการเป็น categorical
// (เหมือนของ ACLS ที่ arrest=แดง/rhythm=เหลืองอำพัน/ฯลฯ) ไม่ใช่สีแบรนด์คอร์ส
// จึงไม่ผูกกับ --color-accent
const TILES = [
  {
    key: 'cpr',
    Icon: HeartPulse,
    label: 'เริ่มบันทึก CPR',
    sub: 'พบคนหมดสติ — เริ่มทันที',
    color: '#DC2626',
    action: 'start',
  },
  {
    key: 'metronome',
    Icon: Activity,
    label: 'ฝึก CPR Metronome',
    sub: 'จังหวะกดหน้าอก 100-120/min',
    color: '#0EA5E9',
    action: 'nav',
    to: '/skill-practice',
  },
  {
    key: 'aed',
    Icon: Zap,
    label: 'การใช้ AED',
    sub: 'ขั้นตอนแปะแผ่น · วิเคราะห์จังหวะ',
    color: '#D97706',
    action: 'nav',
    to: '/bls/aed',
  },
  {
    key: 'choking',
    Icon: Wind,
    label: 'สำลัก / Choking',
    sub: 'ผู้ใหญ่ · เด็ก · ทารก',
    color: '#7C3AED',
    action: 'nav',
    to: '/bls/choking',
  },
];

export default function BLSHomeQuickActions({ onStart, disabled }) {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-2 gap-3">
      {TILES.map((tile) => {
        const Icon = tile.Icon;
        return (
          <button
            key={tile.key}
            onClick={() => (tile.action === 'start' ? onStart('bls') : navigate(tile.to))}
            disabled={tile.action === 'start' && disabled}
            className="card card-hover disabled:opacity-55 disabled:cursor-not-allowed"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
              textAlign: 'left',
            }}
          >
            <div
              className="inline-flex items-center justify-center"
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: `color-mix(in srgb, ${tile.color} 15%, transparent)`,
                color: tile.color,
              }}
            >
              <Icon size={22} strokeWidth={2.2} />
            </div>
            <div className="text-headline mt-3 leading-tight" style={{ color: tile.color }}>
              {tile.label}
            </div>
            <div className="text-caption text-text-muted mt-0.5">{tile.sub}</div>
          </button>
        );
      })}
    </div>
  );
}
