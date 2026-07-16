import { useNavigate } from 'react-router-dom';
import { ChevronRight, HeartPulse, Activity, Zap, HeartCrack } from 'lucide-react';
import { MEGACODE_CHECKLIST_LIST } from '../data/megacodeChecklists';

// Future cases live here as disabled placeholders so the extensibility of
// the checklist registry is visible even before they're built — adding a
// real case is just a new data file + one line in the registry.
const UPCOMING_CASES = [
  { id: 'bradycardia', title: 'Bradycardia', Icon: Activity },
  { id: 'cardiac-arrest', title: 'Cardiac Arrest', Icon: Zap },
  { id: 'acs', title: 'ACS / STEMI', Icon: HeartCrack },
];

export default function MegacodeSelect() {
  const navigate = useNavigate();

  return (
    <div className="page-container space-y-5">
      <div>
        <h1 className="text-title text-text-primary">Megacode Checklist</h1>
        <p className="text-caption text-text-muted mt-0.5">แบบประเมิน Case/Megacode — ฝึกด้วยตนเองหรือให้อาจารย์ประเมิน</p>
      </div>

      <div className="space-y-3">
        {MEGACODE_CHECKLIST_LIST.map(checklist => (
          <button key={checklist.id} onClick={() => navigate(`/megacode/${checklist.id}`)}
            className="w-full dash-card !p-3 text-left hover:bg-bg-tertiary transition-colors flex items-center gap-3">
            <div className="w-10 h-10 inline-flex items-center justify-center bg-danger/10 text-danger shrink-0"
              style={{ borderRadius: 'var(--radius-md)' }}>
              <HeartPulse size={20} strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-body-strong text-text-primary truncate">{checklist.title}</div>
              <div className="text-caption text-text-muted truncate">{checklist.subtitle}</div>
            </div>
            <ChevronRight size={16} strokeWidth={2} className="text-text-muted shrink-0" />
          </button>
        ))}
      </div>

      <div>
        <div className="section-header">เร็ว ๆ นี้</div>
        <div className="space-y-2">
          {UPCOMING_CASES.map(({ id, title, Icon }) => (
            <div key={id} className="dash-card !p-3 flex items-center gap-3 opacity-50">
              <div className="w-10 h-10 inline-flex items-center justify-center bg-bg-tertiary text-text-muted shrink-0"
                style={{ borderRadius: 'var(--radius-md)' }}>
                <Icon size={20} strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-body-strong text-text-primary truncate">{title}</div>
                <div className="text-caption text-text-muted">กำลังจัดทำ</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
