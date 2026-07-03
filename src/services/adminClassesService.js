import { authedGet, authedPost } from './adminApi';

// All cohort classes with both codes + student count (admin-only). Returns
// an array of { id, code, instructor_code, name, course_mode, created_at,
// archived_at, student_count }.
export function fetchClasses() {
  return authedGet('/api/admin/classes');
}

// Archive (or restore) a class. Archiving disables both codes — students
// can no longer join/sync and the instructor summary stops resolving.
export function setClassArchived(classId, archived) {
  return authedPost('/api/admin/classes', { classId, archived });
}
