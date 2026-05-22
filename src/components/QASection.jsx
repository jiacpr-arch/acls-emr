import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { HelpCircle } from 'lucide-react';

const mdComponents = {
  h1: ({ children }) => (
    <h3 className="text-body-strong font-bold text-text-primary mt-3 mb-1.5">{children}</h3>
  ),
  h2: ({ children }) => (
    <h4 className="text-caption font-bold text-danger mt-3 mb-1">{children}</h4>
  ),
  h3: ({ children }) => (
    <h5 className="text-caption font-bold text-text-primary mt-2 mb-1">{children}</h5>
  ),
  p: ({ children }) => (
    <p className="text-caption text-text-secondary leading-relaxed mb-2 last:mb-0">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc pl-5 space-y-1 text-caption text-text-secondary leading-relaxed mb-2">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-5 space-y-1 text-caption text-text-secondary leading-relaxed mb-2">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-bold text-text-primary">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  blockquote: ({ children }) => (
    <div
      className="my-2 px-3 py-2 bg-warning/8 border-l-2 border-warning text-caption text-text-secondary leading-relaxed"
      style={{ borderRadius: 'var(--radius-sm)' }}
    >
      {children}
    </div>
  ),
  code: ({ inline, children }) =>
    inline ? (
      <code className="px-1 py-0.5 bg-bg-tertiary text-[12px] font-mono text-text-primary"
        style={{ borderRadius: 4 }}>
        {children}
      </code>
    ) : (
      <pre className="p-2 bg-bg-tertiary overflow-x-auto text-[12px] font-mono text-text-primary my-2"
        style={{ borderRadius: 'var(--radius-sm)' }}>
        <code>{children}</code>
      </pre>
    ),
  img: ({ src, alt }) => (
    <img
      src={src}
      alt={alt || ''}
      loading="lazy"
      className="w-full h-auto block border border-border my-2"
      style={{ borderRadius: 'var(--radius-sm)' }}
    />
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-2">
      <table className="w-full text-caption border-collapse">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="text-left px-2 py-1 border border-border bg-bg-tertiary font-bold text-text-primary">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-2 py-1 border border-border text-text-secondary">{children}</td>
  ),
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-info underline">
      {children}
    </a>
  ),
  hr: () => <hr className="my-3 border-border" />,
};

function Figure({ img, fallbackAlt }) {
  return (
    <figure className="m-0">
      <img
        src={img.src}
        alt={img.alt || fallbackAlt}
        loading="lazy"
        className="w-full h-auto block border border-border"
        style={{ borderRadius: 'var(--radius-sm)' }}
      />
      {img.caption && (
        <figcaption className="text-[11px] text-text-muted mt-1 leading-relaxed">
          {img.caption}
        </figcaption>
      )}
    </figure>
  );
}

export default function QASection({ qa }) {
  return (
    <div className="space-y-3">
      {qa.map((item, idx) => (
        <div
          key={idx}
          className="border border-border bg-bg-secondary p-3"
          style={{ borderRadius: 'var(--radius-md)' }}
        >
          <div className="flex items-start gap-2 mb-2">
            <div className="w-6 h-6 inline-flex items-center justify-center bg-info/15 text-info shrink-0 mt-0.5"
              style={{ borderRadius: 'var(--radius-sm)' }}>
              <HelpCircle size={14} strokeWidth={2.4} />
            </div>
            <div className="text-body-strong font-bold text-text-primary leading-snug">
              {item.q}
            </div>
          </div>

          {item.images?.length > 0 && (
            <div className="space-y-2 mb-2">
              {item.images.map((img, j) => (
                <Figure key={j} img={img} fallbackAlt={item.q} />
              ))}
            </div>
          )}

          {item.a && (
            <div className="text-caption">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                {item.a}
              </ReactMarkdown>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
