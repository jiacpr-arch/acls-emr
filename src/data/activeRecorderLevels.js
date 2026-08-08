// Active Recorder Hero level source — switches between course packages based
// on VITE_COURSE_MODE, same shim pattern as activeDrillScenarios.js. Skill
// courses fall through to the ACLS branch (harmless — /recorder-game is never
// routed there). See activeRecorderCases.js for a note on this pair of
// shims' known (bundle-size-only, not correctness) tree-shaking limitation.
import { IS_BLS } from '../config/courseMode';
import * as acls from './recorderGameLevels';
import * as bls from '../courses/bls-hcp/recorderGameLevels';

const src = IS_BLS ? bls : acls;

export const ERROR_TYPES = src.ERROR_TYPES;
export const ERROR_TYPE_META = src.ERROR_TYPE_META;
export const GAME_BUTTONS = src.GAME_BUTTONS;
export const ENERGY_CHOICES = src.ENERGY_CHOICES;
export const LEVELS = src.LEVELS;
export const getLevelById = src.getLevelById;
export const getLiveMaxScore = src.getLiveMaxScore;
export const getAuditErrorCount = src.getAuditErrorCount;
