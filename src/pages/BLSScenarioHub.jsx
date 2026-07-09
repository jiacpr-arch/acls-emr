import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import BLSScenarioStageGrid from '../components/precourse/BLSScenarioStageGrid';

// Stage-select hub (standalone page, e.g. for direct links/bookmarks) — the
// primary entry point is now embedded directly on BLSSkillPractice, but this
// route still works on its own and shares the same card grid component.
export default function BLSScenarioHub() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen bg-bg-primary text-text-primary"
      style={{ paddingBottom: 'calc(96px + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="sticky top-0 z-10 bg-bg-primary/90 backdrop-blur border-b border-bg-tertiary">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)}
            className="w-9 h-9 inline-flex items-center justify-center hover:bg-bg-tertiary"
            style={{ borderRadius: 'var(--radius-full)' }} aria-label="Back">
            <ChevronLeft size={20} />
          </button>
          <div className="text-headline">🧠 เกมลำดับขั้น BLS</div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div className="dash-card">
          <div className="text-sm text-text-secondary leading-relaxed">
            เดินตามลำดับขั้น BLS ทีละด่าน <b>8 ด่าน ครบทุกบทเรียน</b> — เลือกคำตอบภายในเวลาที่กำหนด
            ตอบผิดแล้วแก้ใหม่ไม่ได้ ผ่านครบ 8 ด่านเพื่อปลดล็อก <b>ข้อสอบรวม</b>
          </div>
        </div>

        <BLSScenarioStageGrid />
      </div>
    </div>
  );
}
