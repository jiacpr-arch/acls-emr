/* eslint-disable react-refresh/only-export-components */
// Shared Markdown rendering primitives — extracted from QASection.jsx so both the
// Q&A answer surface and the knowledge-base section `body` (SkillKnowledge.jsx)
// render rich content (headings, tables, bold, blockquotes, images) identically.
//
// - `mdComponents`  — the react-markdown component map (GFM: headings, lists,
//   tables, code, blockquote, links, images).
// - `MarkdownImage` — inline `![]()` images with long-press download.
// - `Figure` / `CoverImage` — figure/cover helpers for section- and item-level
//   `images` arrays.
import { ImageIcon } from 'lucide-react';
import { useLongPressDownload } from '../hooks/useLongPressDownload';

// re-export so callers can `import { ImageIcon }` from here if convenient
export { ImageIcon };

export function MarkdownImage({ src, alt }) {
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

export const mdComponents = {
  h1: ({ children }) => (
    <h3
      className="text-[21px] font-extrabold text-text-primary leading-snug mt-8 mb-3 first:mt-2 pb-1.5"
      style={{ borderBottom: '2px solid var(--color-border)' }}
    >
      {children}
    </h3>
  ),
  h2: ({ children }) => (
    <h4 className="text-[19px] font-extrabold text-danger leading-snug mt-8 mb-3 first:mt-2 flex items-center gap-2">
      <span
        aria-hidden
        className="inline-block shrink-0"
        style={{ width: 4, height: 20, background: 'var(--color-danger)', borderRadius: 2 }}
      />
      {children}
    </h4>
  ),
  h3: ({ children }) => (
    <h5 className="text-[16.5px] font-bold text-info leading-snug mt-6 mb-2.5 first:mt-2">
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
    <ul className="list-disc pl-6 space-y-2 text-[15.5px] text-text-secondary mb-4 last:mb-0 marker:text-info"
      style={{ lineHeight: 1.85 }}>
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-6 space-y-2 text-[15.5px] text-text-secondary mb-4 last:mb-0 marker:text-info marker:font-bold"
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

export function CoverImage({ img, fallbackAlt }) {
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
        <div className="px-4 pt-2 text-xs text-text-muted italic leading-relaxed">
          {img.caption}
        </div>
      )}
    </div>
  );
}

export function Figure({ img, fallbackAlt, rounded = 'var(--radius-sm)' }) {
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
        <figcaption className="text-xs text-text-muted mt-1.5 leading-relaxed italic px-1">
          {img.caption}
        </figcaption>
      )}
    </figure>
  );
}
