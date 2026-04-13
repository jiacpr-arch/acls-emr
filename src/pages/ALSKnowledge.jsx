import { useState } from 'react';
import { alsChapters } from '../data/alsContent';

const tipTopics = [
  'การกู้ชีพ', 'จังหวะหัวใจ', 'ยาฉุกเฉิน', 'ทางเดินหายใจ',
  'Defibrillation', 'Post-ROSC care', 'สถานการณ์พิเศษในห้องฉุกเฉิน',
  'การทำงานเป็นทีม', 'CPR คุณภาพสูง', 'H\'s and T\'s',
];

export default function ALSKnowledge() {
  const [tab, setTab] = useState('book');
  const [openCh, setOpenCh] = useState(null);
  const [tip, setTip] = useState('');
  const [tipLoading, setTipLoading] = useState(false);
  const [tipError, setTipError] = useState('');

  const fetchTip = async (topic) => {
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
    } catch (e) {
      setTipError('ไม่สามารถโหลดได้ กรุณาลองใหม่');
    }
    setTipLoading(false);
  };

  return (
    <div className="page-container space-y-4 pb-28">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="w-14 h-14 mx-auto bg-danger rounded-2xl flex items-center justify-center shadow-md">
          <span className="text-3xl">📚</span>
        </div>
        <h1 className="text-2xl font-black text-text-primary">คลังความรู้ ALS</h1>
        <p className="text-xs text-text-muted">Advanced Life Support Knowledge Base</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setTab('book')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors ${
            tab === 'book' ? 'bg-danger text-white' : 'bg-bg-tertiary text-text-secondary'
          }`}>
          📖 หนังสือ ALS
        </button>
        <button onClick={() => setTab('tip')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors ${
            tab === 'tip' ? 'bg-info text-white' : 'bg-bg-tertiary text-text-secondary'
          }`}>
          💡 เกร็ดความรู้ AI
        </button>
      </div>

      {tab === 'book' ? (
        <div className="space-y-2">
          {alsChapters.map(ch => {
            const isOpen = openCh === ch.id;
            return (
              <div key={ch.id} className="bg-bg-secondary rounded-xl overflow-hidden">
                <button onClick={() => setOpenCh(isOpen ? null : ch.id)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
                  <div className="w-9 h-9 rounded-lg bg-danger/10 flex items-center justify-center shrink-0">
                    <span className="text-xl">{ch.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-bold text-text-primary block">{ch.title}</span>
                    <span className="text-[10px] text-text-muted">{ch.sections.length} หัวข้อ</span>
                  </div>
                  <span className={`text-text-muted text-xs transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 space-y-3 animate-slide-up">
                    <div className="h-px bg-bg-tertiary" />
                    {ch.sections.map((s, i) => (
                      <div key={i}>
                        <div className="text-xs font-bold text-danger mb-1">{s.heading}</div>
                        <div className="text-sm text-text-secondary leading-relaxed">{s.body}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Topic chips */}
          <div className="flex flex-wrap gap-2">
            {tipTopics.map(t => (
              <button key={t} onClick={() => fetchTip(t)} disabled={tipLoading}
                className="px-3 py-1.5 rounded-full bg-bg-secondary text-xs font-bold text-text-secondary disabled:opacity-40">
                {t}
              </button>
            ))}
          </div>

          {/* Random button */}
          <button onClick={() => fetchTip(null)} disabled={tipLoading}
            className="w-full py-3 rounded-xl bg-info text-white font-bold text-sm disabled:opacity-50">
            {tipLoading ? '⏳ กำลังสร้าง...' : '🎲 สุ่มเกร็ดความรู้'}
          </button>

          {/* Result */}
          {tip && (
            <div className="bg-bg-secondary rounded-xl p-4 animate-slide-up">
              <div className="text-xs font-bold text-info mb-2">💡 เกร็ดความรู้ ALS</div>
              <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">{tip}</div>
            </div>
          )}
          {tipError && (
            <div className="bg-danger/10 rounded-xl p-4 text-sm text-danger text-center">{tipError}</div>
          )}

          <div className="text-[10px] text-text-muted text-center">
            สร้างโดย AI — ควรตรวจสอบกับแหล่งข้อมูลทางการแพทย์เสมอ
          </div>
        </div>
      )}
    </div>
  );
}
