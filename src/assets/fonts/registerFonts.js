// Registers the Sarabun TTF font with jsPDF so Thai characters, Unicode
// symbols (≥, ≤, ₂, —, °, etc.) and accented Latin render correctly in
// exported reports. Without this, jsPDF falls back to WinAnsi-only
// Helvetica and produces garbage glyphs for anything outside Latin-1.
//
// The base64 payloads in ./sarabun-regular.js / ./sarabun-bold.js are
// generated from the matching .ttf files:
//   base64 -w 0 Sarabun-Regular.ttf  > sarabun-regular.js   (wrapped as ESM)
// Sarabun is licensed under the SIL Open Font License 1.1.

import { jsPDF } from 'jspdf';
import sarabunRegular from './sarabun-regular.js';
import sarabunBold from './sarabun-bold.js';

export const PDF_FONT = 'Sarabun';

let registered = false;

export function registerPDFFonts() {
  if (registered) return;
  registered = true;

  jsPDF.API.events.push(['addFonts', function () {
    this.addFileToVFS('Sarabun-Regular.ttf', sarabunRegular);
    this.addFont('Sarabun-Regular.ttf', PDF_FONT, 'normal');
    this.addFileToVFS('Sarabun-Bold.ttf', sarabunBold);
    this.addFont('Sarabun-Bold.ttf', PDF_FONT, 'bold');
  }]);
}
