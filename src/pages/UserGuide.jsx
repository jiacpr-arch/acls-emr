import { useState } from 'react';
import { guideSections } from '../data/guideContent';

export default function UserGuide() {
  const [openId, setOpenId] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? guideSections.filter(
        s =>
          s.title.toLowerCase().includes(search.toLowerCase()) ||
          s.content.some(c => c.toLowerCase().includes(search.toLowerCase()))
      )
    : guideSections;

  return (
    <div className="page-container space-y-4 pb-28">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="w-14 h-14 mx-auto bg-info rounded-2xl flex items-center justify-center shadow-md">
          <span className="text-3xl">📖</span>
        </div>
        <h1 className="text-2xl font-black text-text-primary">คู่มือการใช้งาน</h1>
        <p className="text-xs text-text-muted">ACLS EMR v2.0 — User Guide</p>
      </div>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="ค้นหาในคู่มือ..."
        className="w-full px-4 py-3 rounded-xl bg-bg-secondary border border-bg-tertiary text-sm text-text-primary focus:outline-none focus:border-info"
      />

      {/* Sections */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center text-text-muted text-sm py-8">
            ไม่พบข้อมูลที่ค้นหา
          </div>
        )}
        {filtered.map(section => {
          const isOpen = openId === section.id;
          return (
            <div key={section.id} className="bg-bg-secondary rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenId(isOpen ? null : section.id)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
              >
                <span className="text-2xl">{section.icon}</span>
                <span className="flex-1 text-sm font-bold text-text-primary">
                  {section.title}
                </span>
                <span
                  className={`text-text-muted text-xs transition-transform ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                >
                  ▼
                </span>
              </button>
              {isOpen && (
                <div className="px-4 pb-4 space-y-2 animate-slide-up">
                  {section.content.map((item, i) => (
                    <div
                      key={i}
                      className="flex gap-2 text-sm text-text-secondary leading-relaxed"
                    >
                      <span className="text-info mt-0.5 shrink-0">•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="text-center text-[10px] text-text-muted pt-4 space-y-1">
        <div>ACLS EMR v2.0 — JIA Trainer Center</div>
        <div>พัฒนาสำหรับการฝึกอบรมและบันทึกการช่วยชีวิตขั้นสูง</div>
      </div>
    </div>
  );
}
