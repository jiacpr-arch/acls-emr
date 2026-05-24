import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { HelpCircle } from 'lucide-react';

const mdComponents = {
  h1: ({ children }) => (
    <h3
      className="text-[18px] font-extrabold text-text-primary leading-snug mt-5 mb-2.5 first:mt-1 pb-1.5"
      style={{ borderBottom: '2px solid var(--color-border)' }}
    >
      {children}
    </h3>
  ),
  h2: ({ children }) => (
    <h4 className="text-[16px] font-bold text-danger leading-snug mt-5 mb-2 first:mt-1 inline-flex items-center gap-2">
      <span
        aria-hidden
        className="inline-block"
        style={{ width: 4, height: 16, background: 'var(--color-danger)', borderRadius: 2 }}
      />
      {children}
    </h4>
  ),
  h3: ({ children }) => (
    <h5 className="text-[15px] font-bold text-info leading-snug mt-4 mb-1.5 first:mt-1">
      {children}
    </h5>
  ),
  p: ({ children }) => (
    <p className="text-[14.5px] text-text-secondary mb-3 last:mb-0" style={{ lineHeight: 1.7 }}>
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc pl-5 space-y-2 text-[14.5px] text-text-secondary mb-3 last:mb-0 marker:text-info"
      style={{ lineHeight: 1.7 }}>
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-5 space-y-2 text-[14.5px] text-text-secondary mb-3 last:mb-0 marker:text-info marker:font-bold"
      style={{ lineHeight: 1.7 }}>
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
      className="my-3 px-4 py-3 bg-warning/8 border-l-[3px] border-warning text-[14.5px] text-text-secondary"
      style={{ borderRadius: 'var(--radius-sm)', lineHeight: 1.7 }}
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
  img: ({ src, alt }) => (
    <img
      src={src}
      alt={alt || ''}
      loading="lazy"
      className="w-full h-auto block border border-border my-3"
      style={{ borderRadius: 'var(--radius-sm)' }}
    />
  ),
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

function Figure({ img, fallbackAlt, rounded = 'var(--radius-sm)' }) {
  return (
    <figure className="m-0">
      <img
        src={img.src}
        alt={img.alt || fallbackAlt}
        loading="lazy"
        className="w-full h-auto block"
        style={{ borderRadius: rounded }}
      />
      {img.caption && (
        <figcaption className="text-[12px] text-text-muted mt-1.5 leading-relaxed italic px-1">
          {img.caption}
        </figcaption>
      )}
    </figure>
  );
}

export default function QASection({ qa, startIndex = 0, showNumber = true }) {
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
            {item.cover && (
              <div className="relative">
                <img
                  src={item.cover.src}
                  alt={item.cover.alt || item.q}
                  loading="lazy"
                  className="w-full h-auto block"
                />
                {item.cover.caption && (
                  <div className="px-4 pt-2 text-[12px] text-text-muted italic leading-relaxed">
                    {item.cover.caption}
                  </div>
                )}
              </div>
            )}

            {/* Question header (info-tinted band) */}
            <header
              className="px-4 py-3.5 sm:px-5 sm:py-4"
              style={{
                background: 'linear-gradient(180deg, rgba(37, 99, 235, 0.06) 0%, rgba(37, 99, 235, 0.02) 100%)',
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
                      background: 'linear-gradient(135deg, var(--color-info) 0%, var(--color-info-dark) 100%)',
                      borderRadius: 999,
                      boxShadow: '0 2px 6px -2px rgba(37, 99, 235, 0.55)',
                      letterSpacing: '0.02em',
                      marginTop: 1,
                    }}
                  >
                    Q{num}
                  </div>
                ) : (
                  <div className="w-7 h-7 inline-flex items-center justify-center bg-info/15 text-info shrink-0 mt-0.5"
                    style={{ borderRadius: 'var(--radius-sm)' }}>
                    <HelpCircle size={15} strokeWidth={2.4} />
                  </div>
                )}
                <h2 className="text-[16px] sm:text-[17px] font-extrabold text-text-primary leading-snug pt-0.5">
                  {item.q}
                </h2>
              </div>
            </header>

            {/* Body: infographics + answer */}
            <div className="px-4 py-4 sm:px-5 sm:py-4">
              {item.images?.length > 0 && (
                <div className="space-y-3 mb-4">
                  {item.images.map((img, j) => (
                    <Figure key={j} img={img} fallbackAlt={item.q} />
                  ))}
                </div>
              )}

              {item.a && (
                <div>
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                    {item.a}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
