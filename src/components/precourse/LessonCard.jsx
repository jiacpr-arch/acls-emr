import { useNavigate } from 'react-router-dom';
import { BookOpen, Check, ChevronRight, Clock, Play } from 'lucide-react';

const LESSON_TONE = {
  // ACLS pre-course
  pc01: 'sky',      // ภาพรวม ACLS
  pc02: 'cyan',     // ประเมินผู้ป่วย
  pc03: 'emerald',  // ป้องกัน Arrest
  pc04: 'red',      // ACS
  pc05: 'violet',   // Stroke
  pc06: 'indigo',   // Bradycardia
  pc07: 'orange',   // Tachycardia
  pc08: 'teal',     // ทีมช่วยชีวิต + CPR Coach
  pc09: 'blue',     // Airway
  pc10: 'rose',     // VF/pVT
  pc11: 'amber',    // PEA/Asystole
  pc12: 'green',    // Post-ROSC
  pc13: 'fuchsia',  // Pharmacology
  // BLS-HCP
  'bls-1':  'sky',
  'bls-2':  'emerald',
  'bls-3':  'red',
  'bls-1r': 'cyan',
  'bls-4':  'orange',
  'bls-5':  'violet',
  'bls-6':  'teal',
  'bls-7':  'fuchsia',
};

const TONE_CLASSES = {
  sky:     { iconBg: 'bg-sky-500/15',     iconText: 'text-sky-500',     stripe: 'bg-sky-500',     btn: 'bg-sky-500' },
  cyan:    { iconBg: 'bg-cyan-500/15',    iconText: 'text-cyan-500',    stripe: 'bg-cyan-500',    btn: 'bg-cyan-500' },
  emerald: { iconBg: 'bg-emerald-500/15', iconText: 'text-emerald-500', stripe: 'bg-emerald-500', btn: 'bg-emerald-500' },
  red:     { iconBg: 'bg-red-500/15',     iconText: 'text-red-500',     stripe: 'bg-red-500',     btn: 'bg-red-500' },
  violet:  { iconBg: 'bg-violet-500/15',  iconText: 'text-violet-500',  stripe: 'bg-violet-500',  btn: 'bg-violet-500' },
  indigo:  { iconBg: 'bg-indigo-500/15',  iconText: 'text-indigo-500',  stripe: 'bg-indigo-500',  btn: 'bg-indigo-500' },
  orange:  { iconBg: 'bg-orange-500/15',  iconText: 'text-orange-500',  stripe: 'bg-orange-500',  btn: 'bg-orange-500' },
  teal:    { iconBg: 'bg-teal-500/15',    iconText: 'text-teal-500',    stripe: 'bg-teal-500',    btn: 'bg-teal-500' },
  blue:    { iconBg: 'bg-blue-500/15',    iconText: 'text-blue-500',    stripe: 'bg-blue-500',    btn: 'bg-blue-500' },
  rose:    { iconBg: 'bg-rose-500/15',    iconText: 'text-rose-500',    stripe: 'bg-rose-500',    btn: 'bg-rose-500' },
  amber:   { iconBg: 'bg-amber-500/15',   iconText: 'text-amber-500',   stripe: 'bg-amber-500',   btn: 'bg-amber-500' },
  green:   { iconBg: 'bg-green-500/15',   iconText: 'text-green-500',   stripe: 'bg-green-500',   btn: 'bg-green-500' },
  fuchsia: { iconBg: 'bg-fuchsia-500/15', iconText: 'text-fuchsia-500', stripe: 'bg-fuchsia-500', btn: 'bg-fuchsia-500' },
};

const DEFAULT_TONE = TONE_CLASSES.blue;

export default function LessonCard({ lesson, read, bestScore, passed, inProgress }) {
  const navigate = useNavigate();
  const hasAttempt = bestScore != null;
  const stepCount = lesson.steps?.length ?? 0;
  const tone = TONE_CLASSES[LESSON_TONE[lesson.id]] ?? DEFAULT_TONE;
  const go = () => navigate(`/pre-course/${lesson.id}`);

  return (
    <div className="dash-card !p-0 overflow-hidden relative">
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${tone.stripe}`} aria-hidden />
      <button
        onClick={go}
        className="w-full flex items-center gap-3 pl-5 pr-4 py-3.5 text-left hover:bg-bg-tertiary/50 transition-colors">
        <div className={`w-10 h-10 inline-flex items-center justify-center shrink-0 ${tone.iconBg} ${tone.iconText}`}
          style={{ borderRadius: 'var(--radius-md)' }}>
          <BookOpen size={18} strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-body-strong text-text-primary truncate">{lesson.title}</div>
          <div className="text-[11px] text-text-muted inline-flex items-center gap-2 mt-0.5">
            <Clock size={11} strokeWidth={2.2} /> ~{lesson.estMinutes} นาที
            <span className="text-text-muted">·</span>
            <span>{stepCount} ขั้น · {lesson.quiz.length} ข้อ</span>
            <span className="text-text-muted">·</span>
            <span>เกณฑ์ {lesson.passingScore}%</span>
          </div>
        </div>
        <ChevronRight size={16} strokeWidth={2.2} className="text-text-muted shrink-0" />
      </button>

      <div className="pl-5 pr-4 pb-3 flex items-center gap-2 flex-wrap">
        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 ${
          passed ? 'bg-success/12 text-success'
            : hasAttempt ? 'bg-warning/12 text-warning'
            : inProgress ? 'bg-info/12 text-info'
            : read ? 'bg-success/12 text-success'
            : 'bg-bg-tertiary text-text-muted'
        }`} style={{ borderRadius: 99 }}>
          {passed ? <><Check size={11} strokeWidth={2.4} /> ผ่าน {bestScore}%</>
            : hasAttempt ? <>ยังไม่ผ่าน · {bestScore}%</>
            : inProgress ? <><Play size={11} strokeWidth={2.4} /> เรียนค้างไว้</>
            : read ? <><Check size={11} strokeWidth={2.4} /> อ่านครบ</>
            : <>ยังไม่เริ่ม</>}
        </span>
        <div className="flex-1" />
        <button
          onClick={(e) => { e.stopPropagation(); go(); }}
          className={`text-[11px] font-bold px-3 py-1.5 inline-flex items-center gap-1 text-white hover:opacity-90 ${tone.btn}`}
          style={{ borderRadius: 99 }}>
          {inProgress ? 'เรียนต่อ' : hasAttempt ? 'ทำใหม่' : 'เริ่มเรียน'}
        </button>
      </div>
    </div>
  );
}
