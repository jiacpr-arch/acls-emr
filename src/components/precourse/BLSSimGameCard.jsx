import { useNavigate } from 'react-router-dom';
import { Gamepad2, ChevronRight, Check } from 'lucide-react';
import { simGameStatus } from '../../data/codeBlueScenarios';

// Entry card on the BLS landing for the BLS Rescue decision game (/sim) —
// same engine as the ACLS Code Blue Sim, BLS scenario pack. Passing every
// built-in case is a certificate requirement, so the card shows progress.
export default function BLSSimGameCard() {
  const navigate = useNavigate();
  const sim = simGameStatus();
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
          เกมตัดสินใจช่วยชีวิต {sim.total} เคส: CPR ผู้ใหญ่ · AED · เด็กและทารก · สำลัก
          — ต้องผ่านครบเพื่อรับใบประกาศนียบัตร
        </div>
      </div>
      {sim.allPassed ? (
        <span
          className="shrink-0 inline-flex items-center justify-center w-6 h-6 text-white shadow-sm"
          style={{ borderRadius: '50%', background: 'var(--color-success)' }}
        >
          <Check size={14} strokeWidth={3} />
        </span>
      ) : (
        <span className="shrink-0 text-2xs font-extrabold text-danger tabular-nums">
          {sim.done}/{sim.total}
        </span>
      )}
      <ChevronRight size={16} strokeWidth={2.4} className="text-text-muted shrink-0" />
    </button>
  );
}
