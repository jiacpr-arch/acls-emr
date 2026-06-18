import { authedGet } from './adminApi';

// Full student roster across all classes (admin-only). Returns an array of
// { id, student_id, name, phone, class_name, class_code, course_mode,
//   created_at, pre_test_passed, post_test_passed }.
export function fetchStudentRoster() {
  return authedGet('/api/admin/students');
}
