-- =====================================================
-- Migration: exam_grades
-- Target project: elyyijlcjfvhxbpzscnv (emr-ai-clinic) — shared by acls-emr and bls-hcp-app
-- Status: APPLIED 24 ก.ย. 2569 (migration exam_grades) — verified: RLS on, no policies, anon reads 0 rows
--
-- Server-graded pre/post-test results. Until now every exam was scored in the browser and the
-- server stored whatever score/passed the client sent (submit_quiz_attempt, the direct insert
-- into acls_assessment_attempts, /api/cert/notify). /api/exam/grade (acls-emr
-- api/exam/grade.js, bls-hcp-app src/app/api/exam/grade/route.js) now re-scores the submitted
-- answers against its own copy of the answer key — the whole served set must be answered — and
-- writes the only trusted record here. Exams can still be TAKEN offline: the app grades a queued
-- attempt the next time it is online, and the certificate step waits for this row.
--
-- Written only by those routes with the service role (RLS on, no policies). attempt_uuid is the
-- client's own attempt uuid (Dexie quizAttempts.uuid), so a retry/second device returns the same
-- row instead of re-grading. Purely additive: nothing existing reads or writes this table.
-- =====================================================

create table if not exists public.exam_grades (
  attempt_uuid     uuid primary key,
  course_mode      text not null check (course_mode in ('acls','bls','airway','defib','iv')),
  exam_kind        text not null check (exam_kind in ('pre','post')),
  lesson_id        text not null,
  bank_id          text not null,
  set_id           text not null,
  student_local_id text,
  class_id         uuid references public.cohort_classes(id) on delete set null,
  student_pk       uuid references public.cohort_students(id) on delete set null,
  hub_user_id      uuid,
  score            numeric not null check (score between 0 and 100),
  correct_count    integer not null check (correct_count >= 0),
  total_questions  integer not null check (total_questions > 0),
  pass_percent     numeric not null,
  passed           boolean not null,
  answers          jsonb not null,
  started_at       timestamptz,
  finished_at      timestamptz,
  graded_at        timestamptz not null default now(),
  source           text not null default 'online' check (source in ('online','sync'))
);
alter table public.exam_grades enable row level security;

create index if not exists exam_grades_student_local_idx on public.exam_grades (student_local_id, lesson_id);
create index if not exists exam_grades_student_pk_idx on public.exam_grades (student_pk) where student_pk is not null;
create index if not exists exam_grades_hub_user_idx on public.exam_grades (hub_user_id) where hub_user_id is not null;

-- Certificate records (written by /api/cert/notify) note whether the pre/post results behind
-- them were server-graded passes, and which grade rows they rest on.
alter table public.certificates add column if not exists exam_verified boolean not null default false;
alter table public.certificates add column if not exists exam_grade_uuids uuid[];

-- Undo (only if nothing reads these yet):
--   alter table public.certificates drop column if exists exam_grade_uuids;
--   alter table public.certificates drop column if exists exam_verified;
--   drop table if exists public.exam_grades;
