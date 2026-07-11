-- =====================================================
-- Migration: student_progress_restore
-- Applied to project: elyyijlcjfvhxbpzscnv (emr-ai-clinic)
--
-- Problem: pre-course progress (lessons read, quiz/pretest/posttest
-- attempts) lives only in the device's IndexedDB. Sync to the cloud is
-- one-way (device -> cloud) for instructor dashboards. A student who
-- re-registers with the same class code + student id from a different
-- browser/device (LINE in-app browser vs. Safari, iOS clearing storage
-- after ~7 days, a new phone, etc.) gets matched to their existing
-- cohort_students row on the next sync flush, but their prior lesson
-- progress and quiz attempts are never pulled back down — the app looks
-- like it "forgot" everything even though the server still has it.
--
-- Fix: a read-only RPC the client calls right when a student identifies
-- themselves in a class (same bearer model as join_class — the class
-- join code + the student's own student_id). If a matching cohort_students
-- row exists, return their lesson progress + quiz attempts so the client
-- can hydrate local IndexedDB before falling back to "start fresh".
-- =====================================================

create or replace function public.get_student_progress(
  p_code text,
  p_student_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_class_id uuid;
  v_student cohort_students%rowtype;
  v_result jsonb;
begin
  v_class_id := _cohort_resolve_class(p_code);

  if p_student_id is null or length(trim(p_student_id)) = 0 then
    return jsonb_build_object('student', null);
  end if;

  select * into v_student
    from cohort_students
    where class_id = v_class_id
      and student_id = trim(p_student_id);

  if not found then
    return jsonb_build_object('student', null);
  end if;

  select jsonb_build_object(
    'student', jsonb_build_object(
      'id', v_student.id,
      'studentId', v_student.student_id,
      'name', v_student.name,
      'phone', v_student.phone,
      'createdAt', v_student.created_at
    ),
    'lessonProgress', coalesce((
      select jsonb_agg(jsonb_build_object(
        'lessonId', lp.lesson_id,
        'readAt', lp.read_at
      ))
      from cohort_lesson_progress lp
      where lp.student_pk = v_student.id
    ), '[]'::jsonb),
    'quizAttempts', coalesce((
      select jsonb_agg(jsonb_build_object(
        'uuid', qa.id,
        'lessonId', qa.lesson_id,
        'score', qa.score,
        'totalQuestions', qa.total_questions,
        'correctCount', qa.correct_count,
        'answers', qa.answers,
        'startedAt', qa.started_at,
        'finishedAt', qa.finished_at,
        'passed', qa.passed,
        'attemptNumber', qa.attempt_number
      ))
      from cohort_quiz_attempts qa
      where qa.student_pk = v_student.id
    ), '[]'::jsonb)
  ) into v_result;

  return v_result;
end;
$$;

grant execute on function public.get_student_progress(text, text) to anon, authenticated;
