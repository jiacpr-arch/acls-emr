// Active lesson source — switches between course packages based on VITE_COURSE_MODE.
// Vite replaces import.meta.env.VITE_COURSE_MODE at build time, so the unused branches are
// tree-shaken from the production bundle.
import { IS_BLS, IS_AIRWAY, IS_DEFIB, IS_IV } from '../config/courseMode';
import * as acls from './preCourseContent';
import * as bls from '../courses/bls-hcp/lessons';
import * as airway from '../courses/airway/lessons';
import * as defib from '../courses/defib/lessons';
import * as iv from '../courses/iv/lessons';

const src = IS_BLS ? bls
  : IS_AIRWAY ? airway
  : IS_DEFIB ? defib
  : IS_IV ? iv
  : acls;

export const preCourseLessons = src.preCourseLessons;
export const preCourseVideos = src.preCourseVideos ?? [];
export const findLessonById = src.findLessonById;
export const getLessonStepCount = src.getLessonStepCount;
export const getLessonQuizCount = src.getLessonQuizCount;
