import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { HelpCircle, Download, ImageIcon } from 'lucide-react';
import { normalizeAnswerMarkdown } from '../utils/normalizeAnswerMarkdown';
import { mdComponents, CoverImage, Figure } from './markdownComponents';

export default function QASection({ qa, startIndex = 0, showNumber = true, accent = null, variant = 'card' }) {
  const isArticle = variant === 'article';

  // When a chapter accent is supplied, theme the question header + badge to it;
  // otherwise fall back to the default info-blue (used on the ALS knowledge page).
  // แบนทั้งชุด — ตัด gradient/เงาสีออก เหลือพื้นสีทึบ + tint อ่อน
  const badgeFlat = accent || 'var(--color-info)';
  const headerBand = accent
    ? `color-mix(in srgb, ${accent} 5%, transparent)`
    : 'rgba(37, 99, 235, 0.04)';
  const iconChip = accent
    ? { background: `color-mix(in srgb, ${accent} 15%, transparent)`, color: accent }
    : null;

  // Article variant: no card chrome, no question header, no cover. The caller
  // renders the breadcrumb/title/cover above; we just render the answer body
  // and any infographics summary at the end.
  if (isArticle) {
    return (
      <div className="space-y-8">
        {qa.map((item, idx) => {
          const num = startIndex + idx + 1;
          const anchorId = `qa-${num}`;
          return (
            <article key={idx} id={anchorId} style={{ scrollMarginTop: 12 }}>
              {item.a && (
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                  {normalizeAnswerMarkdown(item.a)}
                </ReactMarkdown>
              )}

              {item.images?.length > 0 && (
                <div className={item.a ? 'mt-8' : ''}>
                  <div className="flex items-center gap-2.5 mb-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-muted shrink-0">
                      <ImageIcon size={14} strokeWidth={2.4} />
                      สรุปเป็นภาพ
                    </span>
                    <span className="flex-1 h-px bg-border" />
                  </div>
                  <div className="space-y-3">
                    {item.images.map((img, j) => (
                      <Figure key={j} img={img} fallbackAlt={item.q} />
                    ))}
                    <p className="flex items-center gap-1.5 text-[11.5px] text-text-muted">
                      <Download size={12} strokeWidth={2.2} />
                      กดค้างที่รูปเพื่อดาวน์โหลด
                    </p>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {qa.map((item, idx) => {
        const num = startIndex + idx + 1;
        const anchorId = `qa-${num}`;
        return (
          <article
            key={idx}
            id={anchorId}
            className="overflow-hidden bg-bg-secondary border border-border"
            style={{
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 1px 2px rgba(15, 26, 46, 0.04), 0 6px 16px -10px rgba(15, 26, 46, 0.18)',
              scrollMarginTop: 12,
            }}
          >
            {/* Cover image (edge-to-edge at top of card) */}
            {item.cover && <CoverImage img={item.cover} fallbackAlt={item.q} />}

            {/* Question header (accent-tinted band) */}
            <header
              className="px-4 py-3.5 sm:px-5 sm:py-4"
              style={{
                background: headerBand,
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              <div className="flex items-start gap-3">
                {showNumber ? (
                  <div
                    className="shrink-0 inline-flex items-center justify-center text-white font-extrabold text-[13px]"
                    style={{
                      minWidth: 32,
                      height: 28,
                      padding: '0 8px',
                      background: badgeFlat,
                      borderRadius: 999,
                      letterSpacing: '0.02em',
                      marginTop: 1,
                    }}
                  >
                    Q{num}
                  </div>
                ) : (
                  <div
                    className="w-7 h-7 inline-flex items-center justify-center shrink-0 mt-0.5 bg-info/15 text-info"
                    style={{ borderRadius: 'var(--radius-sm)', ...(iconChip || {}) }}
                  >
                    <HelpCircle size={15} strokeWidth={2.4} />
                  </div>
                )}
                <h2 className="text-lg sm:text-[19px] font-extrabold text-text-primary leading-snug pt-0.5">
                  {item.q}
                </h2>
              </div>
            </header>

            {/* Body: answer first, then infographics as a closing summary */}
            <div className="px-4 py-4 sm:px-5 sm:py-4">
              {item.a && (
                <div>
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                    {normalizeAnswerMarkdown(item.a)}
                  </ReactMarkdown>
                </div>
              )}

              {item.images?.length > 0 && (
                <div className={item.a ? 'mt-5' : ''}>
                  {/* Divider before the summary (only when answer text precedes it) */}
                  {item.a && <hr className="mb-4 border-border" />}

                  {/* Section label */}
                  <div className="flex items-center gap-2.5 mb-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-info shrink-0">
                      <ImageIcon size={14} strokeWidth={2.4} />
                      สรุปเป็นภาพ
                    </span>
                    <span className="flex-1 h-px bg-border" />
                  </div>

                  <div className="space-y-3">
                    {item.images.map((img, j) => (
                      <Figure key={j} img={img} fallbackAlt={item.q} />
                    ))}
                    <p className="flex items-center gap-1.5 text-[11.5px] text-text-muted">
                      <Download size={12} strokeWidth={2.2} />
                      กดค้างที่รูปเพื่อดาวน์โหลด
                    </p>
                  </div>
                </div>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
