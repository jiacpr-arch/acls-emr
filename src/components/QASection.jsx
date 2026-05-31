import { useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { HelpCircle, Download, ImageIcon } from 'lucide-react';
import { normalizeAnswerMarkdown } from '../utils/normalizeAnswerMarkdown';

function guessFilename(src, alt) {
  try {
    const url = new URL(src, window.location.href);
    const last = url.pathname.split('/').pop();
    if (last && /\.[a-z0-9]+$/i.test(last)) return decodeURIComponent(last);
  } catch { /* ignore */ }
  const base = (alt || 'infographic')
    .replace(/[^\w฀-๿-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 60) || 'infographic';
  return `${base}.png`;
}

// Fetch the image as a blob so the browser saves it instead of navigating.
// A plain <a download> is ignored for cross-origin (Supabase storage) URLs.
async function downloadImage(src, alt) {
  const filename = guessFilename(src, alt);
  try {
    const res = await fetch(src, { mode: 'cors' });
    if (!res.ok) throw new Error('fetch failed');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  } catch {
    window.open(src, '_blank', 'noopener');
  }
}

// Long-press an image to download it. On touch devices we also suppress the
// native "save image" callout so the press triggers our download instead.
function useLongPressDownload(src, alt, delay = 500) {
  const timer = useRef(null);
  const start = useRef(null);
  const touched = useRef(false);

  const clear = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const onTouchStart = (e) => {
    touched.current = true;
    const t = e.touches?.[0];
    start.current = t ? { x: t.clientX, y: t.clientY } : null;
    clear();
    timer.current = setTimeout(() => downloadImage(src, alt), delay);
  };

  const onTouchMove = (e) => {
    if (!start.current) return;
    const t = e.touches?.[0];
    if (!t) return;
    if (Math.abs(t.clientX - start.current.x) > 12 || Math.abs(t.clientY - start.current.y) > 12) {
      clear();
    }
  };

  const onContextMenu = (e) => {
    if (touched.current) e.preventDefault();
  };

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd: clear,
    onTouchCancel: clear,
    onContextMenu,
    style: { WebkitTouchCallout: 'none', userSelect: 'none' },
    draggable: false,
  };
}

function MarkdownImage({ src, alt }) {
  const press = useLongPressDownload(src, alt);
  const { style, ...handlers } = press;
  return (
    <img
      src={src}
      alt={alt || ''}
      loading="lazy"
      className="w-full h-auto block border border-border my-6"
      style={{ borderRadius: 'var(--radius-sm)', ...style }}
      {...handlers}
    />
  );
}

const mdComponents = {
  h1: ({ children }) => (
    <h3 className="text-[21px] font-extrabold text-text-primary leading-snug mt-8 mb-3 first:mt-2">
      {children}
    </h3>
  ),
  h2: ({ children }) => (
    <h4 className="text-[19px] font-extrabold text-text-primary leading-snug mt-8 mb-3 first:mt-2">
      {children}
    </h4>
  ),
  h3: ({ children }) => (
    <h5 className="text-[16.5px] font-bold text-text-primary leading-snug mt-6 mb-2.5 first:mt-2">
      {children}
    </h5>
  ),
  p: ({ children }) => (
    <p
      className="text-[15.5px] text-text-secondary mb-4 last:mb-0"
      style={{ lineHeight: 1.9 }}
    >
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc pl-6 space-y-2 text-[15.5px] text-text-secondary mb-4 last:mb-0 marker:text-text-muted"
      style={{ lineHeight: 1.85 }}>
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-6 space-y-2 text-[15.5px] text-text-secondary mb-4 last:mb-0 marker:text-text-muted marker:font-bold"
      style={{ lineHeight: 1.85 }}>
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-1">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-bold text-text-primary">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  blockquote: ({ children }) => (
    <div
      className="my-3.5 px-4 py-3 bg-warning/8 border-l-[3px] border-warning text-[15.5px] text-text-secondary"
      style={{ borderRadius: 'var(--radius-sm)', lineHeight: 1.8 }}
    >
      {children}
    </div>
  ),
  code: ({ inline, children }) =>
    inline ? (
      <code className="px-1.5 py-0.5 bg-bg-tertiary text-[13px] font-mono text-text-primary"
        style={{ borderRadius: 4 }}>
        {children}
      </code>
    ) : (
      <pre className="p-3 bg-bg-tertiary overflow-x-auto text-[13px] font-mono text-text-primary my-3"
        style={{ borderRadius: 'var(--radius-sm)', lineHeight: 1.55 }}>
        <code>{children}</code>
      </pre>
    ),
  img: ({ src, alt }) => <MarkdownImage src={src} alt={alt} />,
  table: ({ children }) => (
    <div className="overflow-x-auto my-3">
      <table className="w-full text-[13.5px] border-collapse">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="text-left px-3 py-2 border border-border bg-bg-tertiary font-bold text-text-primary">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-3 py-2 border border-border text-text-secondary align-top"
      style={{ lineHeight: 1.6 }}>
      {children}
    </td>
  ),
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="text-info underline underline-offset-2 hover:text-info/80">
      {children}
    </a>
  ),
  hr: () => <hr className="my-4 border-border" />,
};

function CoverImage({ img, fallbackAlt }) {
  const press = useLongPressDownload(img.src, img.alt || fallbackAlt);
  const { style, ...handlers } = press;
  return (
    <div className="relative mb-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
      <img
        src={img.src}
        alt={img.alt || fallbackAlt}
        loading="lazy"
        className="w-full h-auto block"
        style={style}
        {...handlers}
      />
      {img.caption && (
        <div className="px-4 pt-2 text-[12px] text-text-muted italic leading-relaxed">
          {img.caption}
        </div>
      )}
    </div>
  );
}

function Figure({ img, fallbackAlt, rounded = 'var(--radius-sm)' }) {
  const press = useLongPressDownload(img.src, img.alt || fallbackAlt);
  const { style, ...handlers } = press;
  return (
    <figure className="m-0">
      <img
        src={img.src}
        alt={img.alt || fallbackAlt}
        loading="lazy"
        className="w-full h-auto block"
        style={{ borderRadius: rounded, ...style }}
        {...handlers}
      />
      {img.caption && (
        <figcaption className="text-[12px] text-text-muted mt-1.5 leading-relaxed italic px-1">
          {img.caption}
        </figcaption>
      )}
    </figure>
  );
}

export default function QASection({ qa, startIndex = 0, showNumber = true, accent = null, variant = 'card' }) {
  const isArticle = variant === 'article';

  // When a chapter accent is supplied, theme the question header + badge to it;
  // otherwise fall back to the default info-blue (used on the ALS knowledge page).
  const badgeGradient = accent
    ? `linear-gradient(135deg, ${accent} 0%, color-mix(in srgb, ${accent} 72%, #000) 100%)`
    : 'linear-gradient(135deg, var(--color-info) 0%, var(--color-info-dark) 100%)';
  const badgeShadow = accent
    ? `0 2px 6px -2px color-mix(in srgb, ${accent} 55%, transparent)`
    : '0 2px 6px -2px rgba(37, 99, 235, 0.55)';
  const headerBand = accent
    ? `linear-gradient(180deg, color-mix(in srgb, ${accent} 7%, transparent) 0%, color-mix(in srgb, ${accent} 2%, transparent) 100%)`
    : 'linear-gradient(180deg, rgba(37, 99, 235, 0.06) 0%, rgba(37, 99, 235, 0.02) 100%)';
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
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-text-muted shrink-0">
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
                      background: badgeGradient,
                      borderRadius: 999,
                      boxShadow: badgeShadow,
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
                <h2 className="text-[18px] sm:text-[19px] font-extrabold text-text-primary leading-snug pt-0.5">
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
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-info shrink-0">
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
