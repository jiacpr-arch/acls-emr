import { useState, useEffect } from 'react';
import { alsChapters } from '../data/alsContent';
import {
  GraduationCap, BookOpen, Lightbulb, Bookmark, ChevronDown,
  Sparkles, AlertCircle, Trash, Clock,
} from 'lucide-react';

const STORAGE_KEY = 'als_tips_history';
const CACHE_KEY = 'als_tip_today';

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
    <div className="page-container space-y-4">
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
        <div className="space-y-2">
          {alsChapters.map(ch => {
            const isOpen = openCh === ch.id;
            return (
              <div key={ch.id} className="dash-card !p-0 overflow-hidden">
                <button onClick={() => setOpenCh(isOpen ? null : ch.id)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-bg-tertiary/50 transition-colors">
                  <div className="w-9 h-9 inline-flex items-center justify-center bg-danger/12 text-danger shrink-0"
                    style={{ borderRadius: 'var(--radius-sm)' }}>
                    <BookOpen size={16} strokeWidth={2.2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-body-strong text-text-primary block truncate">{ch.title}</span>
                    <span className="text-[11px] text-text-muted">{ch.sections.length} หัวข้อ</span>
                  </div>
                  <ChevronDown size={16} strokeWidth={2.2}
                    className={`text-text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 space-y-3 animate-slide-up">
                    <div className="h-px bg-border" />
                    {ch.sections.map((s, i) => (
                      <div key={i}>
                        <div className="text-caption font-bold text-danger mb-1">{s.heading}</div>
                        <div className="text-caption text-text-secondary leading-relaxed">{s.body}</div>
                      </div>
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
