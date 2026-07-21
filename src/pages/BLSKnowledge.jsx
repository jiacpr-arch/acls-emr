import { useState, useEffect } from 'react';
import { blsChapters } from '../data/blsKnowledgeContent';
import QASection from '../components/QASection';
import {
  GraduationCap, BookOpen, Lightbulb, Bookmark, ChevronDown,
  Sparkles, AlertCircle, Trash, Clock,
  Heart, HeartPulse, Zap, Users, Wind, Baby, Hospital, Siren, User,
} from 'lucide-react';

/* === Per-chapter visual theme: icon + gradient + accent ===
   Keyed by chapter id (bls-ch1..bls-ch9). */
const CHAPTER_THEMES = {
  'bls-ch1': { Icon: HeartPulse, from: '#3B82F6', to: '#2563EB', accent: '#2563EB' }, // Overview / Chain of Survival
  'bls-ch2': { Icon: Heart,      from: '#F87171', to: '#DC2626', accent: '#DC2626' }, // HQ-CPR
  'bls-ch3': { Icon: Zap,        from: '#FBBF24', to: '#D97706', accent: '#D97706' }, // AED
  'bls-ch4': { Icon: User,       from: '#06B6D4', to: '#0891B2', accent: '#0891B2' }, // One-rescuer
  'bls-ch5': { Icon: Users,      from: '#34D399', to: '#059669', accent: '#059669' }, // 2-rescuer / team
  'bls-ch6': { Icon: Hospital,   from: '#A78BFA', to: '#7C3AED', accent: '#7C3AED' }, // In-hospital
  'bls-ch7': { Icon: Baby,       from: '#C084FC', to: '#9333EA', accent: '#9333EA' }, // Infant / child
  'bls-ch8': { Icon: Wind,       from: '#60A5FA', to: '#2563EB', accent: '#2563EB' }, // FBAO
  'bls-ch9': { Icon: Siren,      from: '#FB923C', to: '#EA580C', accent: '#EA580C' }, // Special situations
};
const DEFAULT_THEME = { Icon: BookOpen, from: '#94A3B8', to: '#475569', accent: '#475569' };

function themeForChapter(ch, index) {
  return CHAPTER_THEMES[ch.id] || CHAPTER_THEMES[`bls-ch${index + 1}`] || DEFAULT_THEME;
}

const STORAGE_KEY = 'bls_tips_history';
const CACHE_KEY = 'bls_tip_today';

const tipTopics = [
  'CPR คุณภาพสูง', 'การใช้ AED', 'การช่วยหายใจ', 'CPR ในเด็กและทารก',
  'การสำลัก/ทางเดินหายใจอุดกั้น', 'การทำงานเป็นทีมกู้ชีพ',
  'Chain of Survival', 'การจมน้ำ', 'BLS ในโรงพยาบาล',
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
  const entry = cache[topic || '_random'];
  if (!entry) return null;
  if (new Date(entry.date).toDateString() === new Date().toDateString()) return entry.text;
  return null;
}
function setTodayCache(topic, text) {
  const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  cache[topic || '_random'] = { text, date: new Date().toISOString() };
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

export default function BLSKnowledge() {
  const [tab, setTab] = useState('book');
  const [openCh, setOpenCh] = useState(null);
  const [tip, setTip] = useState('');
  const [tipLoading, setTipLoading] = useState(false);
  const [tipError, setTipError] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => { setHistory(getHistory()); }, [tip]);

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
        body: JSON.stringify({ topic, course: 'bls' }),
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
        <h1 className="text-title text-text-primary">คลังความรู้ BLS</h1>
        <p className="text-caption text-text-muted">Basic Life Support Knowledge Base</p>
      </div>

      <div className="tab-group">
        <button onClick={() => setTab('book')} className={`tab-item ${tab === 'book' ? 'active' : ''}`}>
          <BookOpen size={14} strokeWidth={2.2} className="inline mr-1" /> หนังสือ
        </button>
        <button onClick={() => setTab('tip')} className={`tab-item ${tab === 'tip' ? 'active' : ''}`}>
          <Lightbulb size={14} strokeWidth={2.2} className="inline mr-1" /> AI Tips
        </button>
        <button onClick={() => setTab('saved')} className={`tab-item ${tab === 'saved' ? 'active' : ''}`}>
          <Bookmark size={14} strokeWidth={2.2} className="inline mr-1" /> บันทึก ({history.length})
        </button>
      </div>

      {tab === 'book' && (
        <div className="space-y-2.5">
          {blsChapters.map((ch, idx) => {
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
                            <QASection qa={s.qa} accent={theme.accent} />
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
                <Lightbulb size={12} strokeWidth={2.2} /> เกร็ดความรู้ BLS
              </div>
              <div className="text-caption text-text-secondary leading-relaxed whitespace-pre-line">{tip}</div>
              <div className="text-2xs text-success mt-2 inline-flex items-center gap-1">
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
          <div className="text-2xs text-text-muted text-center">
            cache วันละ 1 ครั้งต่อหัวข้อ — ควรตรวจสอบกับแหล่งข้อมูลทางการแพทย์เสมอ
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
                    <span className="text-2xs text-text-muted font-mono">
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
