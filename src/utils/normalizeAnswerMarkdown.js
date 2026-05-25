// Normalises "plain text" Q&A answers into readable Markdown.
//
// Stored answers are usually bare text that uses single line breaks to separate
// headings / points and double breaks between blocks, but carries no Markdown
// syntax. CommonMark collapses single line breaks into one paragraph, so the
// reader sees a wall of text. This restores structure heuristically:
//   • single line breaks become separate paragraphs (each point on its own)
//   • a short line ending in ":" becomes a sub-heading
//   • "1. Title" / a short block-leading line becomes a section heading
//   • "A. Sub-title" becomes a sub-heading
//   • an inline "label: rest" prefix is bolded
//   • existing bullet / numbered list items are preserved as a real list
//
// Content already authored as Markdown (has ATX "#" headings or a table) is
// returned untouched so we never double-process it.

const ALREADY_MARKDOWN = /(^|\n)\s{0,3}(#{1,6}\s|\|)/;
const COLON_END = /[:：]\s*$/;
const SENTENCE_END = /[.。,;:：?？!]$/;
const BULLET = /^[-*+]\s+\S/;
const NUM_ITEM = /^(\d+)[.)]\s+(\S.*)$/;
const ALPHA_HEADING = /^([A-Z])[.)]\s+(\S.*)$/;
const INLINE_LABEL = /^([^:：]{1,28})[:：]\s+(\S.*)$/;

function isList(s) {
  return BULLET.test(s) || NUM_ITEM.test(s);
}

export function normalizeAnswerMarkdown(src) {
  if (!src) return '';
  const text = String(src).replace(/\r\n?/g, '\n');
  if (ALREADY_MARKDOWN.test(text)) return text;

  const lines = text.split('\n').map(l => l.trim());
  const out = [];
  const last = () => (out.length ? out[out.length - 1] : '');
  const pushBlank = () => { if (out.length && last() !== '') out.push(''); };
  const pushHeading = (level, txt) => {
    pushBlank();
    out.push(`${'#'.repeat(level)} ${txt}`);
    out.push('');
  };
  const pushBody = (txt) => {
    // Keep markdown lists visually separated from surrounding prose.
    if (isList(txt) && last() && !isList(last()) && last() !== '') pushBlank();
    else if (!isList(txt) && isList(last())) pushBlank();
    out.push(txt);
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) { pushBlank(); continue; }

    const startsBlock = out.length === 0 || last() === '';
    const next = (lines[i + 1] || '').trim();

    // Existing bullet → keep as a list item (normalise marker to "- ").
    if (BULLET.test(line)) { pushBody(line.replace(/^[*+]/, '-')); continue; }

    // "ขนาดและอัตราการให้:" on its own line → sub-heading.
    if (COLON_END.test(line) && line.replace(COLON_END, '').length <= 60) {
      pushHeading(3, line.replace(COLON_END, '').trim());
      continue;
    }

    const numM = line.match(NUM_ITEM);
    if (numM) {
      // "1. ทำไม Hypokalemia ..." leading a block → section heading.
      if (startsBlock && numM[2].length <= 80) {
        pushHeading(2, `${numM[1]}. ${numM[2].trim()}`);
      } else {
        pushBody(`${numM[1]}. ${numM[2].trim()}`);
      }
      continue;
    }

    // "A. ช่วงคลายตัว ..." → sub-heading.
    const alphaM = line.match(ALPHA_HEADING);
    if (alphaM && line.length <= 90) {
      pushHeading(3, `${alphaM[1]}. ${alphaM[2].trim()}`);
      continue;
    }

    // Short, title-like line leading a block (no colon / no sentence end).
    if (
      startsBlock && next &&
      line.length <= 46 &&
      !SENTENCE_END.test(line) &&
      !line.includes(':') && !line.includes('：') &&
      !line.includes(',') && !line.includes('，')
    ) {
      pushHeading(2, line);
      continue;
    }

    // Inline "label: rest" → bold the label.
    const labelled = line.match(INLINE_LABEL);
    if (labelled) { pushBody(`**${labelled[1].trim()}:** ${labelled[2].trim()}`); continue; }

    pushBody(line);
  }

  let md = '';
  for (let i = 0; i < out.length; i++) {
    md += out[i];
    const next = out[i + 1];
    if (next === undefined) break;
    if (out[i] === '' || next === '') md += '\n';
    else if (isList(out[i]) && isList(next)) md += '\n';
    else md += '\n\n';
  }

  return md.replace(/\n{3,}/g, '\n\n').trim();
}
