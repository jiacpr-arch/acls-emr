// Active knowledge-base + scenario-game source for the three skill courses
// (airway / defib / iv). Only meaningful when IS_SKILL_COURSE is true — ACLS
// and BLS have their own dedicated pages/data (ALSKnowledge/BLSKnowledge,
// BLSScenarioHub/BLSScenario) and don't go through this shim.
import { IS_AIRWAY, IS_DEFIB } from '../config/courseMode';
import * as airway from '../courses/airway/knowledge';
import * as defib from '../courses/defib/knowledge';
import * as iv from '../courses/iv/knowledge';
import * as airwayScenarios from '../courses/airway/scenarios';
import * as defibScenarios from '../courses/defib/scenarios';
import * as ivScenarios from '../courses/iv/scenarios';

const knowledgeSrc = IS_AIRWAY ? airway : IS_DEFIB ? defib : iv;
const scenarioSrc = IS_AIRWAY ? airwayScenarios : IS_DEFIB ? defibScenarios : ivScenarios;

export const chapters = knowledgeSrc.chapters;

export const {
  scenarios, FINAL_EXAM_ID, DEFAULT_TIME_LIMIT_SEC, buildFinalExam, getStageById,
  getStageProgress, saveStageProgress, isFinalExamUnlocked, getScenarioGameStatus,
} = scenarioSrc;
