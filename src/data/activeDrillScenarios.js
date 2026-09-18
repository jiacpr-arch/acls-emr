// Active EMR-drill scenario source — switches between course packages based on
// VITE_COURSE_MODE, same shim pattern as activeLessons.js. Tree-shaken at build
// time so a BLS build never bundles the ACLS scenario data and vice versa.
//
// NOT to be confused with src/data/codeBlueScenarios.js (the /sim game's own
// scenario system, backed by the separate @scenario-pack alias) — this module
// backs the /scenarios → /recording EMR drill only. See CLAUDE.md.
import { IS_BLS, IS_SKILL_COURSE } from '../config/courseMode';
import * as acls from './scenarios';
import * as bls from '../courses/bls-hcp/drillScenarios';

// Airway/Defib/IV skill courses don't have an EMR drill (/scenarios is not
// routed for them) — empty array keeps the shim safe to import anywhere.
const EMPTY = { scenarios: [], getScenariosByLevel: () => [], getScenariosByCategory: () => [], getScenarioById: () => undefined };

const src = IS_BLS ? bls : IS_SKILL_COURSE ? EMPTY : acls;

export const scenarios = src.scenarios;
export const getScenariosByLevel = src.getScenariosByLevel;
export const getScenariosByCategory = src.getScenariosByCategory;
export const getScenarioById = src.getScenarioById;
