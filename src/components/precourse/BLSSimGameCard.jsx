import { useNavigate } from 'react-router-dom';
import { Gamepad2, ChevronRight } from 'lucide-react';

// Entry card on the BLS landing for the BLS Rescue decision game (/sim) —
// same engine as the ACLS Code Blue Sim, BLS scenario pack.
export default function BLSSimGameCard() {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate('/sim')}
      className="dash-card w-full flex items-center gap-3 text-left hover:bg-bg-tertiary/50 transition-colors border border-danger/25"
    >
      <div
        className="w-10 h-10 inline-flex items-center justify-center bg-danger/12 text-danger shrink-0"
        style={{ borderRadius: 'var(--radius-md)' }}
      >
        <Gamepad2 size={18} strokeWidth={2.2} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-body-strong text-text-primary">
          เกม BLS Rescue — ภารกิจกู้ชีพ 🚨
        </div>
        <div className="text-2xs text-text-muted">
          เกมตัดสินใจช่วยชีวิต 10 เคส: CPR ผู้ใหญ่ · AED · เด็กและทารก · สำลัก
        </div>
      </div>
      <ChevronRight size={16} strokeWidth={2.4} className="text-text-muted shrink-0" />
    </button>
  );
}
