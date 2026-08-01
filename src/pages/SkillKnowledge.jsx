import { useState } from 'react';
import { chapters } from '../data/activeSkillContent';
import { courseMeta } from '../config/courseMode';
import QASection from '../components/QASection';
import PageHero from '../components/PageHero';
import { BookOpen, ChevronDown } from 'lucide-react';

// Knowledge-base page shared by the three skill courses (airway / defib / iv).
// Modeled on BLSKnowledge.jsx's "book" tab but without the AI-tips tab (that
// needs its own API route per course) or the Supabase media admin hookup
// (deferred — see plan §4, acls_images_parent_type_check). Reading is the
// same schema as ALSKnowledge/BLSKnowledge: chapter.sections[].{heading,body,qa}.
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
                    <article key={i} className="als-section-card">
                      {s.heading && (
                        <h3 className="als-section-heading">
                          <span className="als-section-bar" />
                          {s.heading}
                        </h3>
                      )}
                      {s.body && <p className="als-section-body">{s.body}</p>}
                      {s.qa?.length > 0 && (
                        <div className={s.heading || s.body ? 'mt-3' : ''}>
                          <QASection qa={s.qa} accent={courseMeta.themeColor} />
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
    </div>
  );
}
