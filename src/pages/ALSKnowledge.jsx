import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAlsChapters } from '../hooks/useAlsChapters';
import { ekgQuestions, rhythmLabels, shuffleOptions, quizCategories, EKG_TEST_PASS_PERCENT, EKG_TEST_PASSED_KEY } from '../data/ekgQuiz';
import EKGWaveform from '../components/EKGWaveform';
import QASection from '../components/QASection';
import {
  GraduationCap, BookOpen, Lightbulb, Bookmark, ChevronDown,
  Sparkles, AlertCircle, Trash, Clock, Activity, Check, X, RotateCcw,
  ArrowRight, Heart, HeartPulse, Brain, Stethoscope, Shield, ShieldCheck,
  Users, Wind, Zap, Pill,
} from 'lucide-react';
import JiacprCourseBanner from '../components/JiacprCourseBanner';

/* === Per-chapter visual theme: icon + gradient + accent ===
   Keyed by chapter id (ch1..ch13) with title-based fallback. */
const CHAPTER_THEMES = {
  ch1:  { Icon: HeartPulse,   from: '#3B82F6', to: '#2563EB', accent: '#2563EB' }, // Overview / Chain of Survival
  ch2:  { Icon: Stethoscope,  from: '#06B6D4', to: '#0891B2', accent: '#0891B2' }, // Systematic assessment
  ch3:  { Icon: ShieldCheck,  from: '#A78BFA', to: '#7C3AED', accent: '#7C3AED' }, // Prevention / RRT / Code Blue
  ch4:  { Icon: HeartPulse,   from: '#F87171', to: '#DC2626', accent: '#DC2626' }, // ACS
  ch5:  { Icon: Brain,        from: '#C084FC', to: '#9333EA', accent: '#9333EA' }, // Stroke
  ch6:  { Icon: Activity,     from: '#FBBF24', to: '#D97706', accent: '#D97706' }, // Bradycardia
  ch7:  { Icon: Zap,          from: '#FB923C', to: '#EA580C', accent: '#EA580C' }, // Tachycardia
  ch8:  { Icon: Users,        from: '#34D399', to: '#059669', accent: '#059669' }, // High-perf team / CPR Coach
  ch9:  { Icon: Wind,         from: '#60A5FA', to: '#2563EB', accent: '#2563EB' }, // Airway
  ch10: { Icon: Zap,          from: '#F87171', to: '#B91C1C', accent: '#B91C1C' }, // VF/pVT
  ch11: { Icon: AlertCircle,  from: '#94A3B8', to: '#475569', accent: '#475569' }, // PEA/Asystole
  ch12: { Icon: Heart,        from: '#34D399', to: '#047857', accent: '#047857' }, // Post-arrest
  ch13: { Icon: Pill,         from: '#A78BFA', to: '#6D28D9', accent: '#6D28D9' }, // Pharmacology
};
const DEFAULT_THEME = { Icon: BookOpen, from: '#94A3B8', to: '#475569', accent: '#475569' };

function themeForChapter(ch, index) {
  if (CHAPTER_THEMES[ch.id]) return CHAPTER_THEMES[ch.id];
  const byNum = CHAPTER_THEMES[`ch${index + 1}`];
  return byNum || DEFAULT_THEME;
}

const STORAGE_KEY = 'als_tips_history';
const CACHE_KEY = 'als_tip_today';
const QUIZ_KEY = 'ekg_quiz_best';

const tipTopics = [
  'การกู้ชีพ', 'จังหวะหัวใจ', 'ยาฉุกเฉิน', 'ทางเดินหายใจ',
  'Defibrillation', 'Post-ROSC care', 'สถานการณ์พิเศษในห้องฉุกเฉิน',
  'การทำงานเป็นทีม', 'CPR คุณภาพสูง', "H's and T's",
];

function getHistory() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}
function saveToHistory(topic, text) {
  const history = getHistory();
  history.unshift({ topic: topic || 'สุ่ม', text, date: new Date().toISOString() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 50)));
}
function getTodayCache(topic) {
  const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  const key = topic || '_random';
  const entry = cache[key];
  if (!entry) return null;
  const today = new Date().toDateString();
  if (new Date(entry.date).toDateString() === today) return entry.text;
  return null;
}
function setTodayCache(topic, text) {
  const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  cache[topic || '_random'] = { text, date: new Date().toISOString() };
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

export default function ALSKnowledge() {
  const { chapters: alsChapters } = useAlsChapters();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(() => {
    const t = searchParams.get('tab');
    return ['book', 'tip', 'ekg', 'saved'].includes(t) ? t : 'book';
  });
  const [openCh, setOpenCh] = useState(null);
  const [tip, setTip] = useState('');
  const [tipLoading, setTipLoading] = useState(false);
  const [tipError, setTipError] = useState('');
  const [history, setHistory] = useState([]);
  const [quizCat, setQuizCat] = useState('all');
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizChoice, setQuizChoice] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizBest, setQuizBest] = useState(() => parseInt(localStorage.getItem(QUIZ_KEY) || '0', 10));
  const [quizSeed, setQuizSeed] = useState(() => Date.now() % 100000);

  useEffect(() => { setHistory(getHistory()); }, [tip]);

  const quizPool = useMemo(
    () => quizCat === 'all' ? ekgQuestions : ekgQuestions.filter(q => q.category === quizCat),
    [quizCat]
  );

  const quizOrder = useMemo(() => {
    const arr = quizPool.map((_, i) => i);
    let s = quizSeed || 1;
    for (let i = arr.length - 1; i > 0; i--) {
      s = (s * 9301 + 49297) % 233280;
      const j = Math.floor((s / 233280) * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [quizSeed, quizPool]);

  const quizQ = quizPool[quizOrder[quizIdx]];
  const shuffled = useMemo(
    () => quizQ ? shuffleOptions(quizQ.options, (quizQ.id.charCodeAt(1) || 7) + quizSeed) : [],
    [quizQ, quizSeed]
  );

  const handleQuizAnswer = (choice) => {
    if (quizChoice) return;
    setQuizChoice(choice);
    if (choice === quizQ.answer) setQuizScore(s => s + 1);
  };
  const handleQuizNext = () => {
    if (quizIdx + 1 >= quizPool.length) {
      const final = quizScore;
      if (final > quizBest) {
        setQuizBest(final);
        localStorage.setItem(QUIZ_KEY, String(final));
      }
      // The certification gate is the full bank only — category practice runs
      // don't count toward "passed the EKG test".
      if (quizCat === 'all') {
        const pct = Math.round((final / Math.max(quizPool.length, 1)) * 100);
        if (pct >= EKG_TEST_PASS_PERCENT) localStorage.setItem(EKG_TEST_PASSED_KEY, 'true');
      }
    }
    setQuizChoice(null);
    setQuizIdx(i => i + 1);
  };
  const resetQuiz = () => {
    setQuizIdx(0); setQuizChoice(null); setQuizScore(0);
    setQuizSeed(Date.now() % 100000);
  };
  const handleCategoryChange = (catId) => {
    setQuizCat(catId);
    setQuizIdx(0); setQuizChoice(null); setQuizScore(0);
    setQuizSeed(Date.now() % 100000);
  };
  const quizDone = quizIdx >= quizPool.length;

  const fetchTip = async (topic) => {
    const cached = getTodayCache(topic);
    if (cached) { setTip(cached); return; }
    setTipLoading(true);
    setTipError('');
    setTip('');
    try {
      const res = await fetch('/api/als-tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setTip(data.tip);
      setTodayCache(topic, data.tip);
      saveToHistory(topic, data.tip);
    } catch {
      setTipError('ไม่สามารถโหลดได้ กรุณาลองใหม่');
    }
    setTipLoading(false);
  };

  return (
    <div className="page-container space-y-5">
      <div className="text-center space-y-2">
        <div
          className="w-16 h-16 mx-auto inline-flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, var(--color-danger) 0%, var(--color-danger-dark) 100%)',
            borderRadius: 'var(--radius-2xl)',
            boxShadow: '0 8px 20px rgba(220, 38, 38, 0.28)',
          }}
        >
          <GraduationCap size={28} strokeWidth={2.2} className="text-white" />
        </div>
        <h1 className="text-title text-text-primary">คลังความรู้ ALS</h1>
        <p className="text-caption text-text-muted">Advanced Life Support Knowledge Base</p>
      </div>

      <JiacprCourseBanner />

      <div className="tab-group">
        <button onClick={() => setTab('book')} className={`tab-item ${tab === 'book' ? 'active' : ''}`}>
          <BookOpen size={14} strokeWidth={2.2} className="inline mr-1" /> หนังสือ
        </button>
        <button onClick={() => setTab('tip')} className={`tab-item ${tab === 'tip' ? 'active' : ''}`}>
          <Lightbulb size={14} strokeWidth={2.2} className="inline mr-1" /> AI Tips
        </button>
        <button onClick={() => setTab('ekg')} className={`tab-item ${tab === 'ekg' ? 'active' : ''}`}>
          <Activity size={14} strokeWidth={2.2} className="inline mr-1" /> EKG Quiz
        </button>
        <button onClick={() => setTab('saved')} className={`tab-item ${tab === 'saved' ? 'active' : ''}`}>
          <Bookmark size={14} strokeWidth={2.2} className="inline mr-1" /> บันทึก ({history.length})
        </button>
      </div>

      {tab === 'book' && (
        <div className="space-y-2.5">
          <Link
            to="/qa-acls-deep"
            className="dash-card !p-0 overflow-hidden flex items-center gap-3 px-4 py-4 hover:bg-bg-tertiary/50 active:bg-bg-tertiary transition-colors border-l-4 border-l-info"
          >
            <div
              className="w-11 h-11 inline-flex items-center justify-center bg-info/15 text-info shrink-0"
              style={{ borderRadius: 'var(--radius-md)' }}
            >
              <Sparkles size={20} strokeWidth={2.2} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-headline text-text-primary block">
                Q&A ACLS เชิงลึก
              </span>
              <span className="text-caption text-text-muted">
                คำถาม-คำตอบเชิงลึก พร้อม infographic
              </span>
            </div>
            <ArrowRight size={18} strokeWidth={2.2} className="text-text-muted shrink-0" />
          </Link>
          {alsChapters.map((ch, idx) => {
            const isOpen = openCh === ch.id;
            const theme = themeForChapter(ch, idx);
            const { Icon } = theme;
            const chapterNum = String(idx + 1).padStart(2, '0');
            const cleanTitle = ch.title.replace(/^บทที่\s*\d+\s*:?\s*/u, '').trim() || ch.title;
            return (
              <div
                key={ch.id}
                className={`chapter-card ${isOpen ? 'is-open' : ''}`}
                style={isOpen ? { borderColor: `${theme.accent}55` } : undefined}
              >
                <span
                  className="chapter-card-stripe"
                  style={{ background: `linear-gradient(180deg, ${theme.from} 0%, ${theme.to} 100%)` }}
                />
                <button
                  onClick={() => setOpenCh(isOpen ? null : ch.id)}
                  className="chapter-card-button"
                >
                  <div
                    className="chapter-icon-tile"
                    style={{ background: `linear-gradient(135deg, ${theme.from} 0%, ${theme.to} 100%)` }}
                  >
                    <Icon size={24} strokeWidth={2.2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="chapter-num-tag" style={{ color: theme.accent }}>
                      บทที่ {chapterNum}
                    </div>
                    <span className="chapter-title">{cleanTitle}</span>
                    <span
                      className="chapter-meta-pill"
                      style={{
                        background: `${theme.accent}18`,
                        color: theme.accent,
                      }}
                    >
                      <BookOpen size={11} strokeWidth={2.4} />
                      {ch.sections.length} หัวข้อ
                    </span>
                  </div>
                  <span className="chapter-chevron">
                    <ChevronDown size={16} strokeWidth={2.4} />
                  </span>
                </button>
                {isOpen && (
                  <div className="px-3 pb-4 pt-3 space-y-3 animate-slide-up bg-bg-tertiary/30 border-t border-border">
                    {ch.sections.map((s, i) => (
                      <article key={i} className="als-section-card">
                        {s.heading && (
                          <h3 className="als-section-heading">
                            <span className="als-section-bar" />
                            {s.heading}
                          </h3>
                        )}
                        {s.body && (
                          <p className="als-section-body">{s.body}</p>
                        )}
                        {s.images?.length > 0 && (
                          <div className={`space-y-3 ${s.heading || s.body ? 'mt-3' : ''}`}>
                            {s.images.map((img, j) => (
                              <figure key={j} className="m-0">
                                <img
                                  src={img.src}
                                  alt={img.alt || s.heading}
                                  loading="lazy"
                                  className="w-full h-auto block border border-border"
                                  style={{ borderRadius: 'var(--radius-md)' }}
                                />
                                {img.caption && (
                                  <figcaption className="als-section-caption">
                                    {img.caption}
                                  </figcaption>
                                )}
                              </figure>
                            ))}
                          </div>
                        )}
                        {s.qa?.length > 0 && (
                          <div className={s.heading || s.body || s.images?.length ? 'mt-3' : ''}>
                            <QASection qa={s.qa} />
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tab === 'tip' && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {tipTopics.map(t => (
              <button key={t} onClick={() => fetchTip(t)} disabled={tipLoading}
                className="px-3 py-1.5 bg-bg-secondary border border-border text-caption font-bold text-text-secondary hover:bg-bg-tertiary disabled:opacity-40 transition-colors"
                style={{ borderRadius: 99 }}>
                {t}
              </button>
            ))}
          </div>
          <button onClick={() => fetchTip(null)} disabled={tipLoading}
            className="btn btn-primary btn-lg btn-block disabled:opacity-50">
            {tipLoading ? (
              <><Clock size={16} strokeWidth={2.2} className="animate-pulse" /> กำลังสร้าง…</>
            ) : (
              <><Sparkles size={16} strokeWidth={2.2} /> สุ่มเกร็ดความรู้</>
            )}
          </button>
          {tip && (
            <div className="dash-card animate-slide-up border-l-4 border-l-info">
              <div className="text-overline text-info mb-2 inline-flex items-center gap-1.5">
                <Lightbulb size={12} strokeWidth={2.2} /> เกร็ดความรู้ ALS
              </div>
              <div className="text-caption text-text-secondary leading-relaxed whitespace-pre-line">{tip}</div>
              <div className="text-[11px] text-success mt-2 inline-flex items-center gap-1">
                <Bookmark size={11} strokeWidth={2.2} /> บันทึกแล้วอัตโนมัติ
              </div>
            </div>
          )}
          {tipError && (
            <div className="bg-danger/8 border border-danger/30 p-3 text-caption text-danger text-center inline-flex items-center justify-center gap-2"
              style={{ borderRadius: 'var(--radius-md)' }}>
              <AlertCircle size={14} strokeWidth={2.2} /> {tipError}
            </div>
          )}
          <div className="text-[11px] text-text-muted text-center">
            cache วันละ 1 ครั้งต่อหัวข้อ — ควรตรวจสอบกับแหล่งข้อมูลทางการแพทย์เสมอ
          </div>
        </div>
      )}

      {tab === 'ekg' && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {quizCategories.map(c => (
              <button key={c.id} onClick={() => handleCategoryChange(c.id)}
                className={`px-2.5 py-1 text-[11px] font-bold border transition-colors ${
                  quizCat === c.id
                    ? 'bg-info/15 border-info/50 text-info'
                    : 'bg-bg-secondary border-border text-text-secondary hover:bg-bg-tertiary'
                }`}
                style={{ borderRadius: 99 }}>
                {c.label}
                <span className="ml-1 opacity-60">
                  ({c.id === 'all' ? ekgQuestions.length : ekgQuestions.filter(q => q.category === c.id).length})
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between text-caption">
            <span className="text-text-muted">
              ข้อ <span className="text-text-primary font-bold">{Math.min(quizIdx + 1, quizPool.length)}</span> / {quizPool.length}
            </span>
            <span className="text-text-muted">
              คะแนน: <span className="text-info font-bold">{quizScore}</span>
              <span className="mx-1">·</span>
              สถิติ: <span className="text-success font-bold">{quizBest}</span>
            </span>
          </div>
          <div className="progress-track !h-1.5">
            <div className="progress-fill bg-info" style={{ width: `${(Math.min(quizIdx, quizPool.length) / Math.max(quizPool.length, 1)) * 100}%` }} />
          </div>

          {!quizDone && quizQ && (
            <div className="dash-card space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="text-overline text-info inline-flex items-center gap-1.5">
                  <Activity size={12} strokeWidth={2.2} /> จังหวะนี้คืออะไร?
                </div>
                {quizQ.pulse === 'none' && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-danger/15 text-danger border border-danger/40"
                    style={{ borderRadius: 99 }}>
                    คลำชีพจรไม่ได้ · NO PULSE
                  </span>
                )}
                {quizQ.pulse === 'present' && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-success/15 text-success border border-success/40"
                    style={{ borderRadius: 99 }}>
                    มีชีพจร · PULSE PRESENT
                  </span>
                )}
              </div>
              <div className="overflow-hidden border border-border" style={{ borderRadius: 'var(--radius-sm)' }}>
                {quizQ.imageUrl ? (
                  <img
                    src={quizQ.imageUrl}
                    alt={`EKG: ${quizQ.answer}`}
                    loading="lazy"
                    className="w-full h-auto block"
                    style={{ background: '#fff7f0' }}
                  />
                ) : (
                  <EKGWaveform rhythmId={quizQ.rhythmId} variant="paper" />
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {shuffled.map(opt => {
                  const isAnswered = quizChoice !== null;
                  const isCorrect = opt === quizQ.answer;
                  const isPicked = opt === quizChoice;
                  let cls = 'bg-bg-secondary border-border text-text-primary hover:bg-bg-tertiary';
                  if (isAnswered) {
                    if (isCorrect) cls = 'bg-success/15 border-success/50 text-success';
                    else if (isPicked) cls = 'bg-danger/15 border-danger/50 text-danger';
                    else cls = 'bg-bg-secondary border-border text-text-muted opacity-60';
                  }
                  return (
                    <button key={opt} onClick={() => handleQuizAnswer(opt)} disabled={isAnswered}
                      className={`px-3 py-2.5 border text-caption font-bold transition-colors text-left inline-flex items-center justify-between gap-2 ${cls}`}
                      style={{ borderRadius: 'var(--radius-sm)' }}>
                      <span>{rhythmLabels[opt] || opt}</span>
                      {isAnswered && isCorrect && <Check size={14} strokeWidth={2.4} />}
                      {isAnswered && isPicked && !isCorrect && <X size={14} strokeWidth={2.4} />}
                    </button>
                  );
                })}
              </div>
              {quizChoice && (
                <div className="animate-slide-up space-y-2">
                  <div className={`p-3 border-l-4 ${quizChoice === quizQ.answer ? 'bg-success/8 border-l-success' : 'bg-warning/8 border-l-warning'}`}
                    style={{ borderRadius: 'var(--radius-sm)' }}>
                    <div className={`text-caption font-bold mb-1 ${quizChoice === quizQ.answer ? 'text-success' : 'text-warning'}`}>
                      {quizChoice === quizQ.answer ? 'ถูกต้อง!' : `เฉลย: ${rhythmLabels[quizQ.answer]}`}
                    </div>
                    <div className="text-caption text-text-secondary leading-relaxed">{quizQ.hint}</div>
                  </div>
                  <button onClick={handleQuizNext} className="btn btn-primary btn-block">
                    {quizIdx + 1 >= quizPool.length ? 'ดูสรุปคะแนน' : 'ข้อถัดไป'}
                  </button>
                </div>
              )}
            </div>
          )}

          {quizDone && (
            <div className="dash-card text-center space-y-3 animate-slide-up">
              <div className={`text-numeric text-5xl ${quizScore / Math.max(quizPool.length, 1) >= 0.8 ? 'text-success' : quizScore / Math.max(quizPool.length, 1) >= 0.5 ? 'text-warning' : 'text-danger'}`}>
                {quizScore}<span className="text-2xl text-text-muted">/{quizPool.length}</span>
              </div>
              <div className="text-caption text-text-muted">
                {quizScore / Math.max(quizPool.length, 1) >= 0.8 ? 'เยี่ยมมาก! อ่าน EKG แม่นยำ' : quizScore / Math.max(quizPool.length, 1) >= 0.5 ? 'ผ่านได้ ลองฝึกซ้ำเพื่อแม่นขึ้น' : 'ทบทวนบทที่ 4 แล้วลองใหม่ครับ'}
              </div>
              {quizScore > quizBest && (
                <div className="text-caption text-success font-bold">สถิติใหม่!</div>
              )}
              {quizCat === 'all' && (quizScore / Math.max(quizPool.length, 1)) * 100 >= EKG_TEST_PASS_PERCENT && (
                <div className="text-caption text-success font-bold inline-flex items-center justify-center gap-1.5 w-full">
                  <Check size={14} strokeWidth={2.6} /> ผ่าน EKG test (เกณฑ์ {EKG_TEST_PASS_PERCENT}%) — นับเป็นเงื่อนไข Certification
                </div>
              )}
              <button onClick={resetQuiz} className="btn btn-primary btn-block">
                <RotateCcw size={14} strokeWidth={2.2} /> เริ่มใหม่
              </button>
            </div>
          )}

          <div className="text-[11px] text-text-muted text-center">
            ภาพ EKG เป็นภาพประกอบเพื่อการเรียนรู้ — การวินิจฉัยจริงต้องใช้ EKG 12 leads
          </div>
        </div>
      )}

      {tab === 'saved' && (
        <div className="space-y-2">
          {history.length === 0 ? (
            <div className="text-center text-text-muted text-caption py-10">ยังไม่มีบันทึก</div>
          ) : (
            <>
              {history.map((item, i) => (
                <div key={i} className="dash-card !p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-caption font-bold text-info inline-flex items-center gap-1.5">
                      <Lightbulb size={13} strokeWidth={2.2} /> {item.topic}
                    </span>
                    <span className="text-[10px] text-text-muted font-mono">
                      {new Date(item.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-caption text-text-secondary leading-relaxed whitespace-pre-line">{item.text}</div>
                </div>
              ))}
              <button onClick={() => { localStorage.removeItem(STORAGE_KEY); setHistory([]); }}
                className="btn btn-ghost btn-sm btn-block mt-2">
                <Trash size={14} strokeWidth={2} /> ล้างบันทึกทั้งหมด
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
