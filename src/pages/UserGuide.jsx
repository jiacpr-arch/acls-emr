import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { guideSections } from '../data/guideContent';
import {
  BookOpen, Plus, HeartPulse, GitBranch, Sparkles, HelpCircle,
  Search, X, ChevronDown, MessageSquare, FileText,
} from 'lucide-react';

const quickLinks = [
  { Icon: Plus, label: 'เริ่มเคส', sectionId: 'newcase' },
  { Icon: HeartPulse, label: 'CPR', sectionId: 'cpr' },
  { Icon: GitBranch, label: 'Pathways', sectionId: 'pathways' },
  { Icon: Sparkles, label: 'ฝึกซ้อม', sectionId: 'scenarios' },
  { Icon: HelpCircle, label: 'FAQ', sectionId: 'faq' },
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
    <div className="page-container space-y-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <div
          className="w-16 h-16 mx-auto inline-flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, var(--color-info) 0%, var(--color-info-dark) 100%)',
            borderRadius: 'var(--radius-2xl)',
            boxShadow: '0 8px 20px rgba(37, 99, 235, 0.28)',
          }}
        >
          <BookOpen size={28} strokeWidth={2.2} className="text-white" />
        </div>
        <h1 className="text-title text-text-primary">คู่มือการใช้งาน</h1>
        <p className="text-caption text-text-muted">ACLS EMR v2.0 — User Guide</p>
      </div>

      {/* Quick Links */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {quickLinks.map(ql => {
          const QIcon = ql.Icon;
          const active = openId === ql.sectionId;
          return (
            <button
              key={ql.sectionId}
              onClick={() => jumpTo(ql.sectionId)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-2 text-caption font-bold transition-colors border ${
                active
                  ? 'bg-info text-white border-info-dark'
                  : 'bg-bg-secondary text-text-secondary border-border hover:bg-bg-tertiary'
              }`}
              style={{ borderRadius: 99 }}
            >
              <QIcon size={14} strokeWidth={2.2} />
              <span>{ql.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} strokeWidth={2} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="ค้นหาในคู่มือ…"
          className="w-full px-4 py-3 pl-10 text-caption text-text-primary"
          style={{ paddingLeft: 38 }}
        />
        {search && (
          <button onClick={() => setSearch('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 inline-flex items-center justify-center text-text-muted hover:bg-bg-tertiary"
            style={{ borderRadius: 99 }}>
            <X size={14} strokeWidth={2.2} />
          </button>
        )}
      </div>

      {/* Section count */}
      <div className="text-caption text-text-muted">
        {search ? `พบ ${filtered.length} หัวข้อ` : `ทั้งหมด ${guideSections.length} หัวข้อ`}
      </div>

      {/* Sections */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center text-text-muted text-caption py-10">ไม่พบข้อมูลที่ค้นหา</div>
        )}
        {filtered.map((section) => {
          const isOpen = openId === section.id;
          return (
            <div key={section.id} id={`section-${section.id}`} className="dash-card !p-0 overflow-hidden">
              <button
                onClick={() => setOpenId(isOpen ? null : section.id)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-bg-tertiary/50 transition-colors"
              >
                <div className="w-9 h-9 inline-flex items-center justify-center bg-bg-tertiary text-text-secondary shrink-0"
                  style={{ borderRadius: 'var(--radius-sm)' }}>
                  <FileText size={16} strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-body-strong text-text-primary block truncate">{section.title}</span>
                  <span className="text-[11px] text-text-muted">{section.content.length} รายการ</span>
                </div>
                <ChevronDown size={16} strokeWidth={2.2}
                  className={`text-text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOpen && (
                <div className="px-4 pb-4 space-y-2.5 animate-slide-up">
                  <div className="h-px bg-border" />
                  {section.content.map((item, i) => (
                    <div key={i} className="flex gap-2.5 text-caption text-text-secondary leading-relaxed">
                      <span className="text-info mt-1.5 shrink-0 w-1 h-1" style={{ background: 'currentColor', borderRadius: 99 }} />
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
      <div className="dash-card text-center space-y-3 py-5">
        <div className="text-body-strong text-text-primary">พบปัญหาหรือมีข้อเสนอแนะ?</div>
        <button
          onClick={() => navigate('/feedback')}
          className="btn btn-primary"
        >
          <MessageSquare size={16} strokeWidth={2.2} /> ส่ง Feedback
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
