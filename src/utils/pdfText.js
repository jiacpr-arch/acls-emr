// Sanitises strings before they are drawn into a PDF.
//
// Sarabun covers Thai + Latin + most punctuation/math symbols, but it does
// NOT contain emoji glyphs. Anything in the emoji ranges would render as
// .notdef (a hollow box) — visually only marginally better than the old
// mojibake — so we strip those code points entirely. The event labels in
// the app use emoji as decorative prefixes, so removing them does not lose
// any clinical information.

const EMOJI_REGEX = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{2300}-\u{23FF}\u{2B00}-\u{2BFF}\u{1F100}-\u{1F1FF}]/gu;
const COMBINING_REGEX = /[\u{FE0F}\u{200D}]/gu;

export function sanitisePDFText(value) {
  if (value == null) return '';
  return String(value)
    .replace(EMOJI_REGEX, '')
    .replace(COMBINING_REGEX, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}
