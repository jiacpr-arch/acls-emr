// Active Q&A เชิงลึก static-content source — switches between course packages
// based on VITE_COURSE_MODE, same shim pattern as activeDrillScenarios.js.
// Skill courses fall through to the ACLS branch (harmless — /qa-acls-deep and
// /qa-deep are both gated to IS_ACLS/IS_BLS only in App.jsx, never routed there).
import { IS_BLS } from '../config/courseMode';
import { qaDeepPage as aclsPage, qaDeepItems as aclsItems } from './qaDeepContent';
import { qaDeepPage as blsPage, qaDeepItems as blsItems, qaDeepChapters as blsChapters } from '../courses/bls-hcp/qaDeepContent';

const src = IS_BLS
  ? { qaDeepPage: blsPage, qaDeepItems: blsItems, qaDeepChapters: blsChapters }
  : { qaDeepPage: aclsPage, qaDeepItems: aclsItems, qaDeepChapters: [] };

export const qaDeepPage = src.qaDeepPage;
export const qaDeepItems = src.qaDeepItems;
// ACLS ไม่มี static chapters (มาจาก Supabase acls_chapters เท่านั้น) — [] ที่นี่
// ไม่ได้ใช้งานจริงฝั่ง ACLS เพราะ qaDeepService.js ยัง query Supabase ตามเดิม
export const qaDeepChapters = src.qaDeepChapters;
