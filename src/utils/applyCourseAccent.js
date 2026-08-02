import { courseMeta } from '../config/courseMode';

// Sets the per-course brand accent (bottom nav active tab, in-page tab
// switcher, hero gradients) so each of the 5 course builds — different
// Vercel projects/subdomains — is visually distinguishable at a glance,
// not just by page text. Deliberately scoped to structural/brand chrome
// only; semantic action colors (--color-danger/-success/-warning/...)
// stay fixed across all courses so "primary action" never accidentally
// reads as "destructive action" just because a course's brand happens
// to be red (ACLS).
export function applyCourseAccent() {
  const root = document.documentElement;
  root.style.setProperty('--color-accent', courseMeta.themeColor);
  root.style.setProperty('--color-accent-dark', courseMeta.themeColorDark);
}
