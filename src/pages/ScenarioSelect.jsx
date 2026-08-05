import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { scenarios, getScenariosByLevel } from '../data/scenarios';
import { useCaseStore } from '../stores/caseStore';
import { getScenarioGrades } from '../utils/scenarioProgress';
import {
  Heart, TrendingDown, TrendingUp, Brain, FileText,
  ChevronRight, X, GraduationCap, Edit,
} from '../components/ui/Icon';
import { Target } from 'lucide-react';
import JiacprCourseBanner from '../components/JiacprCourseBanner';
import PageHero from '../components/PageHero';

const GRADE_TONE = {
  A: 'bg-success/15 text-success',
  B: 'bg-info/15 text-info',
  C: 'bg-warning/15 text-warning',
  D: 'bg-danger/15 text-danger',
  F: 'bg-danger/15 text-danger',
};

const LEVEL_TH = { all: 'ทั้งหมด', basic: 'พื้นฐาน', intermediate: 'กลาง', megacode: 'Megacode' };
const CATEGORY_TH = {
  cardiac_arrest: 'หัวใจหยุดเต้น', bradycardia: 'หัวใจเต้นช้า', tachycardia: 'หัวใจเต้นเร็ว',
  mi: 'หัวใจขาดเลือด', stroke: 'สโตรก',
};

export default function ScenarioSelect() {
  const navigate = useNavigate();
  const createCase = useCaseStore(s => s.createCase);
  const [filterLevel, setFilterLevel] = useState('all');
  const [loading, setLoading] = useState(false);
  const [briefScenario, setBriefScenario] = useState(null);
  const grades = useMemo(() => getScenarioGrades(), []);

  const filtered = filterLevel === 'all' ? scenarios : getScenariosByLevel(filterLevel);

  const levelTone = {
    basic: 'bg-success/15 text-success',
    intermediate: 'bg-warning/15 text-warning',
    megacode: 'bg-danger/15 text-danger',
  };

  const categoryIcon = {
    cardiac_arrest: Heart,
    bradycardia: TrendingDown,
    tachycardia: TrendingUp,
    mi: Heart,
    stroke: Brain,
  };

  const startScenario = async (scenarioId, chosenMode) => {
    if (loading) return;
    setLoading(true);
    await createCase('training');
    navigate(`/recording?start=bls&scenario=${scenarioId}&mode=${chosenMode}`);
  };

  return (
    <div className="page-container flex flex-col gap-4">
      <PageHero
        eyebrow="เส้นทางฝึกผู้บันทึก · ขั้น 2/2"
        title="สอบสนามจริง"
        desc="Training Scenarios — ทำโจทย์บนหน้า Recording จริง"
      />

      <JiacprCourseBanner />

      {/* ขั้น 1 ของเส้นทาง: ซ้อมมือกับปุ่มจำลองก่อน */}
      <button onClick={() => navigate('/recorder-game')}
        className="card card-hover w-full flex items-center gap-3"
        style={{ textAlign: 'left', justifyContent: 'flex-start' }}>
        <div className="flex items-center justify-center shrink-0"
          style={{ width: 44, height: 44, borderRadius: 12, background: '#2563EB15', color: '#2563EB' }}>
          <Target size={22} strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-body-strong text-text-primary">ยังไม่คุ้นปุ่มบันทึก?</div>
          <div className="text-caption text-text-muted">กลับไปขั้น 1 · ซ้อมมือ Recorder — ฝึกจำปุ่ม + จับผิด log ก่อน แล้วค่อยมาสอบจริงที่นี่</div>
        </div>
        <ChevronRight size={16} strokeWidth={2} className="text-text-muted shrink-0" />
      </button>

      {/* Level filter */}
      <div className="tab-group">
        {['all', 'basic', 'intermediate', 'megacode'].map(l => (
          <button key={l} onClick={() => setFilterLevel(l)}
            className={`tab-item ${filterLevel === l ? 'active' : ''}`}>
            {LEVEL_TH[l]}
          </button>
        ))}
      </div>

      {/* Scenario list */}
      <div className="space-y-3">
        {filtered.map(s => {
          const CatIcon = categoryIcon[s.category] || FileText;
          return (
            <button key={s.id} onClick={() => setBriefScenario(s)}
              className="w-full dash-card !p-3 text-left hover:bg-bg-tertiary transition-colors flex items-center gap-3">
              <div className="w-10 h-10 inline-flex items-center justify-center bg-bg-tertiary text-text-secondary shrink-0"
                style={{ borderRadius: 'var(--radius-md)' }}>
                <CatIcon size={20} strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-body-strong text-text-primary truncate">{s.title_th}</div>
                <div className="text-caption text-text-muted truncate">{s.description_th}</div>
                <div className="flex items-center gap-2 text-2xs text-text-muted mt-0.5 font-mono">
                  <span>{s.steps.length} ขั้นตอน</span>
                  <span>·</span>
                  <span>{CATEGORY_TH[s.category] || s.category}</span>
                </div>
              </div>
              {grades[s.id]?.grade && (
                <span className={`badge font-black ${GRADE_TONE[grades[s.id].grade] || ''}`}
                  title={grades[s.id].examPassed ? 'ผ่านโหมด Exam แล้ว' : 'เกรดที่ดีที่สุด'}>
                  {grades[s.id].grade}{grades[s.id].examPassed ? ' ✓' : ''}
                </span>
              )}
              <span className={`badge ${levelTone[s.level]}`}>{LEVEL_TH[s.level] || s.level}</span>
              <ChevronRight size={16} strokeWidth={2} className="text-text-muted shrink-0" />
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-10 text-text-muted text-caption">ไม่พบสถานการณ์</div>
      )}

      {/* Brief modal: อธิบายวิธีเล่น + เลือกโหมด */}
      {briefScenario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setBriefScenario(null)}>
          <div className="w-full max-w-sm max-h-[85dvh] overflow-y-auto bg-bg-secondary p-5 space-y-4 animate-slide-up"
            onClick={e => e.stopPropagation()}
            style={{ borderRadius: 'var(--radius-2xl)', boxShadow: 'var(--shadow-pop)' }}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 inline-flex items-center justify-center bg-bg-tertiary text-text-secondary"
                  style={{ borderRadius: 'var(--radius-lg)' }}>
                  {(() => {
                    const I = categoryIcon[briefScenario.category] || FileText;
                    return <I size={24} strokeWidth={2} />;
                  })()}
                </div>
                <div>
                  <h2 className="text-headline text-text-primary">{briefScenario.title_th}</h2>
                  <span className={`badge mt-1 inline-flex ${levelTone[briefScenario.level]}`}>
                    {LEVEL_TH[briefScenario.level] || briefScenario.level}
                  </span>
                </div>
              </div>
              <button onClick={() => setBriefScenario(null)}
                className="w-8 h-8 inline-flex items-center justify-center text-text-muted hover:bg-bg-tertiary"
                style={{ borderRadius: 99 }}>
                <X size={18} strokeWidth={2.2} />
              </button>
            </div>

            <div className="bg-bg-primary p-3 border border-border" style={{ borderRadius: 'var(--radius-md)' }}>
              <div className="text-caption text-text-secondary">{briefScenario.description_th}</div>
              <div className="text-2xs text-text-muted mt-2 font-mono">ทั้งหมด {briefScenario.steps.length} ขั้นตอน</div>
            </div>

            <div className="bg-bg-primary p-3 border border-border space-y-1.5" style={{ borderRadius: 'var(--radius-md)' }}>
              <div className="section-header">วิธีเล่น</div>
              <BriefLine>คุณคือผู้บันทึก (Recorder) ของทีมกู้ชีพ</BriefLine>
              <BriefLine>ตัวละครบนฉากจะเล่าเหตุการณ์ทีละขั้น</BriefLine>
              <BriefLine>กดบันทึกบนหน้า Recording จริงให้ตรงขั้นตอน ACLS — ทำถูกจึงไปขั้นต่อไป</BriefLine>
              <BriefLine>ผิดครบ 4 ครั้ง อาจารย์จะเข้ายึดเคส</BriefLine>
              {briefScenario.category === 'cardiac_arrest' && (
                <BriefLine tone="warning">⚠ Shock / เช็คชีพจร / Epi ซ้ำ ต้องรอครบรอบ CPR 2 นาทีก่อน</BriefLine>
              )}
            </div>

            <button onClick={() => startScenario(briefScenario.id, 'learning')} disabled={loading}
              className="btn btn-info btn-lg btn-block disabled:opacity-50">
              <GraduationCap size={16} strokeWidth={2.4} /> {loading ? 'กำลังโหลด…' : 'เริ่มโหมดฝึก — มีคำใบ้ทุกขั้น'}
            </button>
            <button onClick={() => startScenario(briefScenario.id, 'exam')} disabled={loading}
              className="btn btn-lg btn-block disabled:opacity-50 border border-purple text-purple">
              <Edit size={16} strokeWidth={2.4} /> {loading ? 'กำลังโหลด…' : 'เริ่มโหมดสอบ — ไม่มีคำใบ้ เก็บคะแนน'}
            </button>
            <button onClick={() => setBriefScenario(null)} className="btn btn-ghost btn-sm btn-block">ปิด</button>
          </div>
        </div>
      )}
    </div>
  );
}

function BriefLine({ children, tone }) {
  return (
    <div className={`text-2xs flex items-start gap-1.5 ${tone === 'warning' ? 'text-warning font-bold' : 'text-text-secondary'}`}>
      <span className={`shrink-0 mt-1 ${tone === 'warning' ? 'text-warning' : 'text-info'}`}>•</span>
      <span>{children}</span>
    </div>
  );
}
