import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { chapters } from '../data/activeSkillContent';
import { courseMeta } from '../config/courseMode';
import QASection from '../components/QASection';
import { mdComponents, Figure } from '../components/markdownComponents';
import PageHero from '../components/PageHero';
import {
  BookOpen, ChevronDown, Target, Lightbulb, AlertTriangle,
  Stethoscope, ClipboardCheck, BookMarked,
} from 'lucide-react';

// กล่อง callout เชิงการสอน — section ที่มี `kind` จะ render เป็นกล่องสีแยกประเภท
// (section ปกติที่ไม่มี kind ยังใช้ als-section-card เดิม → backward-compatible)
// สี case ใช้ธีมของคอร์ส ที่เหลืออิง semantic token ใน index.css
const CALLOUT = {
  objective: { label: 'วัตถุประสงค์การเรียนรู้', Icon: Target, color: 'var(--color-info)' },
  pearl: { label: 'Clinical Pearl', Icon: Lightbulb, color: 'var(--color-success)' },
  warning: { label: 'กับดัก / ข้อควรระวัง', Icon: AlertTriangle, color: 'var(--color-warning)' },
  case: { label: 'กรณีศึกษา', Icon: Stethoscope, color: courseMeta.themeColor },
  summary: { label: 'สรุปประเด็นสำคัญ', Icon: ClipboardCheck, color: 'var(--color-danger)' },
  evidence: { label: 'หลักฐาน / แนวทาง', Icon: BookMarked, color: '#7C3AED' },
};

// Knowledge-base page shared by the three skill courses (airway / defib / iv).
// Modeled on BLSKnowledge.jsx's "book" tab but without the AI-tips tab (that
// needs its own API route per course) or the Supabase media admin hookup
// (deferred — see plan §4, acls_images_parent_type_check). Reading is the
// same schema as ALSKnowledge/BLSKnowledge: chapter.sections[].{heading,body,qa}.
// เนื้อหาหนึ่ง section — render markdown body + รูป + Q&A ร่วมกัน
// ถ้า section มี `kind` → ห่อด้วยกล่อง callout สี + ป้ายประเภท, ไม่งั้นใช้การ์ดปกติ
function SectionInner({ s, accent }) {
  return (
    <>
      {s.heading && (
        <h3 className="als-section-heading">
          <span className="als-section-bar" style={accent ? { background: accent } : undefined} />
          {s.heading}
        </h3>
      )}
      {s.body && (
        <div className="als-section-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
            {s.body}
          </ReactMarkdown>
        </div>
      )}
      {s.images?.length > 0 && (
        <div className={`space-y-3 ${s.heading || s.body ? 'mt-3' : ''}`}>
          {s.images.map((img, j) => (
            <Figure key={j} img={img} fallbackAlt={s.heading} />
          ))}
        </div>
      )}
      {s.qa?.length > 0 && (
        <div className={s.heading || s.body || s.images?.length ? 'mt-3' : ''}>
          <QASection qa={s.qa} accent={accent || courseMeta.themeColor} />
        </div>
      )}
    </>
  );
}

function Section({ s }) {
  const callout = s.kind ? CALLOUT[s.kind] : null;
  if (!callout) {
    return (
      <article className="als-section-card">
        <SectionInner s={s} />
      </article>
    );
  }
  const { label, Icon, color } = callout;
  return (
    <article className="als-callout" style={{ '--callout-color': color }}>
      <div className="als-callout-chip" style={{ color }}>
        <Icon size={13} strokeWidth={2.6} />
        {label}
      </div>
      <SectionInner s={s} accent={color} />
    </article>
  );
}

export default function SkillKnowledge() {
  const [openCh, setOpenCh] = useState(null);

  return (
    <div className="page-container flex flex-col gap-4">
      <PageHero
        title={`คลังความรู้ ${courseMeta.shortName}`}
        desc={`${courseMeta.title} Knowledge Base`}
      />

      <div className="space-y-2.5">
        {chapters.map((ch, idx) => {
          const isOpen = openCh === ch.id;
          const chapterNum = String(idx + 1).padStart(2, '0');
          const cleanTitle = ch.title.replace(/^บทที่\s*\d+\s*:?\s*/u, '').trim() || ch.title;
          return (
            <div
              key={ch.id}
              className={`chapter-card ${isOpen ? 'is-open' : ''}`}
              style={isOpen ? { borderColor: `${courseMeta.themeColor}55` } : undefined}
            >
              <span
                className="chapter-card-stripe"
                style={{ background: courseMeta.themeColor }}
              />
              <button
                onClick={() => setOpenCh(isOpen ? null : ch.id)}
                className="chapter-card-button"
              >
                <div
                  className="chapter-icon-tile text-2xl"
                  style={{ background: `${courseMeta.themeColor}15` }}
                >
                  {ch.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="chapter-num-tag" style={{ color: courseMeta.themeColor }}>
                    บทที่ {chapterNum}
                  </div>
                  <span className="chapter-title">{cleanTitle}</span>
                  <span
                    className="chapter-meta-pill"
                    style={{ background: `${courseMeta.themeColor}18`, color: courseMeta.themeColor }}
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
                    <Section key={i} s={s} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
