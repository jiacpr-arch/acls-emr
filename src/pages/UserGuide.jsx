import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { guideSections } from '../data/guideContent';

const quickLinks = [
  { icon: '🆕', label: 'เริ่มเคส', sectionId: 'newcase' },
  { icon: '💓', label: 'CPR', sectionId: 'cpr' },
  { icon: '🔀', label: 'Pathways', sectionId: 'pathways' },
  { icon: '🎮', label: 'ฝึกซ้อม', sectionId: 'scenarios' },
  { icon: '❓', label: 'FAQ', sectionId: 'faq' },
];

export default function UserGuide() {
  const navigate = useNavigate();
  const [openId, setOpenId] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? guideSections.filter(
        s =>
          s.title.toLowerCase().includes(search.toLowerCase()) ||
          s.content.some(c => c.toLowerCase().includes(search.toLowerCase()))
      )
    : guideSections;

  const jumpTo = (id) => {
    setSearch('');
    setOpenId(id);
    setTimeout(() => {
      document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

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

      {/* Quick Links */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {quickLinks.map(ql => (
          <button
            key={ql.sectionId}
            onClick={() => jumpTo(ql.sectionId)}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold transition-colors ${
              openId === ql.sectionId
                ? 'bg-info text-white'
                : 'bg-bg-secondary text-text-secondary'
            }`}
          >
            <span>{ql.icon}</span>
            <span>{ql.label}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="ค้นหาในคู่มือ..."
          className="w-full px-4 py-3 pl-10 rounded-xl bg-bg-secondary border border-bg-tertiary text-sm text-text-primary focus:outline-none focus:border-info"
        />
        <span className="absolute left-3.5 top-3.5 text-text-muted text-sm">🔍</span>
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-3 text-text-muted text-sm">
            ✕
          </button>
        )}
      </div>

      {/* Section count */}
      <div className="text-xs text-text-muted">
        {search ? `พบ ${filtered.length} หัวข้อ` : `ทั้งหมด ${guideSections.length} หัวข้อ`}
      </div>

      {/* Sections */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center text-text-muted text-sm py-8">
            ไม่พบข้อมูลที่ค้นหา
          </div>
        )}
        {filtered.map((section, idx) => {
          const isOpen = openId === section.id;
          return (
            <div key={section.id} id={`section-${section.id}`} className="bg-bg-secondary rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenId(isOpen ? null : section.id)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
              >
                <div className="w-9 h-9 rounded-lg bg-bg-primary flex items-center justify-center shrink-0">
                  <span className="text-xl">{section.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-bold text-text-primary block">{section.title}</span>
                  <span className="text-[10px] text-text-muted">{section.content.length} รายการ</span>
                </div>
                <span className={`text-text-muted text-xs transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              {isOpen && (
                <div className="px-4 pb-4 space-y-2.5 animate-slide-up">
                  <div className="h-px bg-bg-tertiary" />
                  {section.content.map((item, i) => (
                    <div key={i} className="flex gap-2.5 text-sm text-text-secondary leading-relaxed">
                      <span className="text-info mt-0.5 shrink-0 text-xs">●</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Feedback CTA */}
      <div className="bg-bg-secondary rounded-xl p-4 text-center space-y-2">
        <div className="text-sm font-bold text-text-primary">พบปัญหาหรือมีข้อเสนอแนะ?</div>
        <button
          onClick={() => navigate('/feedback')}
          className="px-6 py-2.5 rounded-xl bg-info text-white text-sm font-bold"
        >
          💬 ส่ง Feedback
        </button>
      </div>

      {/* Footer */}
      <div className="text-center text-[10px] text-text-muted pt-2 space-y-1">
        <div>ACLS EMR v2.0 — JIA Trainer Center</div>
        <div>พัฒนาสำหรับการฝึกอบรมและบันทึกการช่วยชีวิตขั้นสูง</div>
      </div>
    </div>
  );
}
