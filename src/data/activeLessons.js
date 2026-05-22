// Active lesson source — switches between ACLS and BLS-HCP based on VITE_COURSE_MODE.
// Vite replaces import.meta.env.VITE_COURSE_MODE at build time, so the unused branch is
// tree-shaken from the production bundle.
import { IS_BLS } from '../config/courseMode';
import * as acls from './preCourseContent';
import * as bls from '../courses/bls-hcp/lessons';

const src = IS_BLS ? bls : acls;

export const preCourseLessons = src.preCourseLessons;
export const preCourseVideos = src.preCourseVideos ?? [];
export const findLessonById = src.findLessonById;
export const getLessonStepCount = src.getLessonStepCount;
export const getLessonQuizCount = src.getLessonQuizCount;
