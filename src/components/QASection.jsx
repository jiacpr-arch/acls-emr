import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { HelpCircle } from 'lucide-react';

const mdComponents = {
  h1: ({ children }) => (
    <h3 className="text-[17px] font-bold text-text-primary leading-snug mt-4 mb-2 first:mt-0">
      {children}
    </h3>
  ),
  h2: ({ children }) => (
    <h4 className="text-[15px] font-bold text-danger leading-snug mt-4 mb-2 first:mt-0">
      {children}
    </h4>
  ),
  h3: ({ children }) => (
    <h5 className="text-[14px] font-bold text-text-primary leading-snug mt-3 mb-1.5 first:mt-0">
      {children}
    </h5>
  ),
  p: ({ children }) => (
    <p className="text-[14px] text-text-secondary mb-3 last:mb-0" style={{ lineHeight: 1.65 }}>
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc pl-5 space-y-1.5 text-[14px] text-text-secondary mb-3 last:mb-0"
      style={{ lineHeight: 1.65 }}>
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-5 space-y-1.5 text-[14px] text-text-secondary mb-3 last:mb-0"
      style={{ lineHeight: 1.65 }}>
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
      className="my-3 px-4 py-3 bg-warning/8 border-l-[3px] border-warning text-[14px] text-text-secondary"
      style={{ borderRadius: 'var(--radius-sm)', lineHeight: 1.65 }}
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
      <table className="w-full text-[13px] border-collapse">{children}</table>
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
        <figcaption className="text-[12px] text-text-muted mt-1.5 leading-relaxed italic">
          {img.caption}
        </figcaption>
      )}
    </figure>
  );
}

export default function QASection({ qa }) {
  return (
    <div className="space-y-4">
      {qa.map((item, idx) => (
        <div
          key={idx}
          className="border border-border bg-bg-secondary p-4 sm:p-5"
          style={{ borderRadius: 'var(--radius-md)' }}
        >
          <div className="flex items-start gap-2.5 mb-3">
            <div className="w-7 h-7 inline-flex items-center justify-center bg-info/15 text-info shrink-0 mt-0.5"
              style={{ borderRadius: 'var(--radius-sm)' }}>
              <HelpCircle size={15} strokeWidth={2.4} />
            </div>
            <div className="text-[15px] font-bold text-text-primary leading-snug pt-0.5">
              {item.q}
            </div>
          </div>

          {item.images?.length > 0 && (
            <div className="space-y-3 mb-3">
              {item.images.map((img, j) => (
                <Figure key={j} img={img} fallbackAlt={item.q} />
              ))}
            </div>
          )}

          {item.a && (
            <>
              <div className="h-px bg-border my-3" />
              <div>
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                  {item.a}
                </ReactMarkdown>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
