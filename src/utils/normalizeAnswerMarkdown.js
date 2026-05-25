// Normalises "plain text" Q&A answers into readable Markdown.
//
// Many stored answers (DeepSeek output, admin paste) arrive as bare text that
// uses single line breaks to separate headings / list items but carries no
// Markdown syntax. CommonMark collapses single line breaks into one paragraph,
// so the reader sees a wall of text. This restores structure heuristically:
//   • single line breaks become hard breaks (each line stays on its own line)
//   • a short line ending in ":" becomes a sub-heading
//   • a short, punctuation-free line that leads a block becomes a section heading
//   • an inline "label: rest" prefix is bolded
//
// Content that already looks like real Markdown is returned untouched.

const ALREADY_MARKDOWN = /(^|\n)\s{0,3}(#{1,6}\s|[-*+]\s|\d+[.)]\s|>\s|\|)/;
const COLON_END = /[:：]\s*$/;
const SENTENCE_END = /[.。,;:：?？!]$/;

export function normalizeAnswerMarkdown(src) {
  if (!src) return '';
  const text = String(src);
  if (text.includes('**') || text.includes('__') || ALREADY_MARKDOWN.test(text)) {
    return text;
  }

  const lines = text.replace(/\r\n?/g, '\n').split('\n').map(l => l.trim());
  const out = [];
  const pushBlank = () => {
    if (out.length && out[out.length - 1] !== '') out.push('');
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) {
      pushBlank();
      continue;
    }

    const startsBlock = out.length === 0 || out[out.length - 1] === '';
    const next = (lines[i + 1] || '').trim();

    // "ขนาดและอัตราการให้:"  → sub-heading
    if (COLON_END.test(line) && line.replace(COLON_END, '').length <= 60) {
      pushBlank();
      out.push(`### ${line.replace(COLON_END, '').trim()}`);
      out.push('');
      continue;
    }

    // Short, title-like line that leads a block of content → section heading.
    // A heading must not carry a colon (those are labels, handled below).
    if (
      startsBlock &&
      next &&
      line.length <= 46 &&
      !SENTENCE_END.test(line) &&
      !line.includes(':') &&
      !line.includes('：') &&
      !line.includes(',') &&
      !line.includes('，')
    ) {
      pushBlank();
      out.push(`## ${line}`);
      out.push('');
      continue;
    }

    // Inline "label: rest" → bold the label.
    const labelled = line.match(/^([^:：]{1,28})[:：]\s+(\S.*)$/);
    if (labelled) {
      out.push(`**${labelled[1].trim()}:** ${labelled[2].trim()}`);
      continue;
    }

    out.push(line);
  }

  let md = '';
  for (let i = 0; i < out.length; i++) {
    md += out[i];
    const next = out[i + 1];
    if (next === undefined) break;
    // Blank line between blocks; hard break between adjacent content lines.
    md += out[i] === '' || next === '' ? '\n' : '  \n';
  }

  return md.replace(/\n{3,}/g, '\n\n').trim();
}
