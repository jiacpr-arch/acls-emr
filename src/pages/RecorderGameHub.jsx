import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LEVELS } from '../data/recorderGameLevels';
import { CASE_PACKS } from '../data/recorderCases';
import { loadProgress, isUnlocked, getTotalStars } from '../utils/recorderGameProgress';
import { usePreCourseStore } from '../stores/preCourseStore';
import { useClassStore } from '../stores/classStore';
import StudentIdentityModal from '../components/precourse/StudentIdentityModal';
import { Target, Star, Lock, ChevronRight, Shuffle, Layers, User } from 'lucide-react';

// ==========================================
// Recorder Hero — หน้าเลือกด่าน (hub)
// แสดงด่านทั้งหมด + ดาว + hi-score + ล็อก/ปลดล็อก
// ==========================================
const TYPE_BADGE = {
  hunt:  { label: 'รู้จักปุ่ม', color: 'text-info' },
  live:  { label: 'บันทึกสด', color: 'text-danger' },
  audit: { label: 'ตรวจ Log', color: 'text-purple' },
};

function Stars({ n }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3].map(i => (
        <Star key={i} size={13} strokeWidth={2}
          className={i <= n ? 'text-warning' : 'text-bg-tertiary'}
          fill={i <= n ? 'currentColor' : 'none'} />
      ))}
    </div>
  );
}

export default function RecorderGameHub() {
  const navigate = useNavigate();
  const progress = loadProgress();
  const totalStars = getTotalStars(progress);
  const levels = [...LEVELS].sort((a, b) => a.order - b.order);
  const activeStudent = usePreCourseStore(s => s.activeStudent);
  const classCode = useClassStore(s => s.classCode);
  const [showIdentity, setShowIdentity] = useState(false);

  return (
    <div className="page-container space-y-3 pb-28">
      {/* อยู่ในคลาส: บอกว่ากำลังบันทึกผลในชื่อใคร — เกมนอกคลาสไม่มี summary ให้บันทึก
          จึงไม่ต้องกวนนักเรียนที่เล่นเดี่ยว/ออฟไลน์ให้ลงทะเบียน (เหมือน GamesHub) */}
      {classCode && (
        <div className={`flex items-center justify-between gap-2 px-3 py-2.5 text-caption ${
          activeStudent ? 'bg-bg-tertiary' : 'bg-warning/8 border border-warning/30'
        }`} style={{ borderRadius: 'var(--radius-md)' }}>
          <span className="inline-flex items-center gap-1.5 min-w-0">
            <User size={14} strokeWidth={2.4} className={activeStudent ? 'text-text-muted shrink-0' : 'text-warning shrink-0'} />
            <span className="truncate">
              {activeStudent
                ? <>บันทึกผลในชื่อ <b className="text-text-primary">{activeStudent.name}</b></>
                : 'ยังไม่ได้ลงทะเบียน — จะถูกขอชื่อก่อนเริ่มเล่น'}
            </span>
          </span>
          <button onClick={() => setShowIdentity(true)}
            className="btn btn-ghost btn-sm shrink-0">
            {activeStudent ? 'เปลี่ยน' : 'ลงทะเบียน'}
          </button>
        </div>
      )}

      {/* Header */}
      <div className="text-center pt-2 flex flex-col items-center gap-2">
        <div className="w-14 h-14 inline-flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, var(--color-purple) 0%, var(--color-info) 100%)',
            borderRadius: 'var(--radius-2xl)',
            boxShadow: '0 8px 20px rgba(124, 58, 237, 0.32)',
          }}>
          <Target size={26} strokeWidth={2.4} className="text-white" />
        </div>
        <h1 className="text-title text-text-primary">Recorder Hero</h1>
        <p className="text-caption text-text-muted">ฝึกกดบันทึก Code Blue ให้ถูก ให้ทัน ลดข้อผิดพลาด</p>
        <div className="inline-flex items-center gap-1.5 text-warning font-black">
          <Star size={16} strokeWidth={2.4} fill="currentColor" /> {totalStars} / {levels.length * 3} ดาว
        </div>
      </div>

      {/* โหมดเล่น */}
      <div className="text-overline">โหมดเล่น</div>
      <button onClick={() => navigate('/recorder-game/endless')}
        className="w-full dash-card !p-3 flex items-center gap-3 text-left hover:bg-bg-tertiary transition-colors">
        <div className="w-10 h-10 shrink-0 inline-flex items-center justify-center text-white"
          style={{ background: 'linear-gradient(135deg, var(--color-shock) 0%, var(--color-danger) 100%)', borderRadius: 'var(--radius-md)' }}>
          <Shuffle size={18} strokeWidth={2.4} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-caption font-black text-text-primary">Endless Shuffle</div>
          <div className="text-3xs text-text-muted">สุ่มเคสหลายรูปแบบต่อเนื่อง เก็บคะแนนให้ได้มากที่สุด</div>
        </div>
        <ChevronRight size={18} strokeWidth={2.2} className="text-text-muted shrink-0" />
      </button>

      {/* Case Packs */}
      <div className="text-overline">ชุดเคส (Case Packs)</div>
      <div className="space-y-2">
        {CASE_PACKS.map(pack => (
          <button key={pack.id} onClick={() => navigate(`/recorder-game/${pack.id}`)}
            className="w-full dash-card !p-3 flex items-center gap-3 text-left hover:bg-bg-tertiary transition-colors">
            <div className="w-10 h-10 shrink-0 inline-flex items-center justify-center bg-bg-tertiary text-text-secondary"
              style={{ borderRadius: 'var(--radius-md)' }}>
              <Layers size={18} strokeWidth={2.4} />
            </div>
            <div className="flex-1 min-w-0">
              <div className={`text-caption font-black ${pack.color}`}>{pack.title_th}</div>
              <div className="text-3xs text-text-muted truncate">{pack.subtitle_th}</div>
            </div>
            <ChevronRight size={18} strokeWidth={2.2} className="text-text-muted shrink-0" />
          </button>
        ))}
      </div>

      {/* Campaign Levels */}
      <div className="text-overline">แคมเปญ (ไล่ระดับ)</div>
      <div className="space-y-2">
        {levels.map(level => {
          const unlocked = isUnlocked(level, levels, progress);
          const p = progress[level.id] || { stars: 0, hiscore: 0 };
          const badge = TYPE_BADGE[level.type] || {};
          return (
            <button key={level.id}
              onClick={() => unlocked && navigate(`/recorder-game/${level.id}`)}
              disabled={!unlocked}
              className={`w-full dash-card !p-3 flex items-center gap-3 text-left transition-colors ${
                unlocked ? 'hover:bg-bg-tertiary' : 'opacity-55'
              }`}>
              <div className="w-10 h-10 shrink-0 inline-flex items-center justify-center bg-bg-tertiary font-black text-text-secondary"
                style={{ borderRadius: 'var(--radius-md)' }}>
                {unlocked ? level.order : <Lock size={16} strokeWidth={2.4} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-caption font-black text-text-primary truncate">{level.title_th}</span>
                  <span className={`text-3xs font-bold shrink-0 ${badge.color}`}>{badge.label}</span>
                </div>
                <div className="text-3xs text-text-muted truncate">{level.subtitle_th}</div>
                <div className="flex items-center gap-2 mt-1">
                  <Stars n={p.stars} />
                  {p.hiscore > 0 && <span className="text-3xs text-text-muted">Hi: {p.hiscore}</span>}
                </div>
              </div>
              {unlocked && <ChevronRight size={18} strokeWidth={2.2} className="text-text-muted shrink-0" />}
            </button>
          );
        })}
      </div>

      <div className="text-3xs text-text-muted text-center px-4 leading-relaxed">
        ปุ่มในเกมจำลองจากหน้า Recording จริง — เล่นเกมนี้ไม่สร้างเคสจริงในระบบ
      </div>

      <StudentIdentityModal
        open={showIdentity}
        onClose={() => setShowIdentity(false)}
        onConfirm={() => setShowIdentity(false)}
      />
    </div>
  );
}
