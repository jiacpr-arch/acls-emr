// Active Recorder Hero case source — switches between course packages based on
// VITE_COURSE_MODE, same shim pattern as activeLessons.js / activeDrillScenarios.js.
// Recorder Hero (/recorder-game) is only routed for ACLS and BLS builds. Skill
// courses fall through to the ACLS branch (harmless — never routed there, so
// never reached at runtime).
//
// NOTE: because this module is imported from both the main bundle and the
// lazy-loaded admin chunk (AdminRecorderCases → RecorderCaseEditor), the
// bundler was observed to keep BOTH courses' raw case data present (as dead,
// unreachable code) in a given build's bundle, even though `src` still
// resolves correctly at runtime per IS_BLS — verified: ACLS build's LEVELS/
// CASES/CATEGORY_ACTIONS only ever contain ACLS entries at runtime, and vice
// versa. This is a bundle-size nit (a few KB of unreachable text), not a
// correctness issue — left as a known follow-up rather than over-engineering
// the chunk graph for it.
import { IS_BLS } from '../config/courseMode';
import * as acls from './recorderCases';
import * as bls from '../courses/bls-hcp/recorderCases';

const src = IS_BLS ? bls : acls;

export const CASE_CATEGORY_META = src.CASE_CATEGORY_META;
export const CASE_CATEGORIES = src.CASE_CATEGORIES;
export const CATEGORY_ACTIONS = src.CATEGORY_ACTIONS;
export const CASES = src.CASES;
export const CASE_PACKS = src.CASE_PACKS;
export const getPackById = src.getPackById;
export const blankEvent = src.blankEvent;
export const blankCase = src.blankCase;
export const getCaseById = src.getCaseById;
export const getCasesByCategory = src.getCasesByCategory;
export const pickRandomCase = src.pickRandomCase;
export const caseToLevel = src.caseToLevel;
