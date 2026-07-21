-- =====================================================
-- Migration: practical_checkin_exam_case
-- Project: emr-ai-clinic (elyyijlcjfvhxbpzscnv)
--
-- ฐานสอบแบบ "สุ่มข้อสอบล็อกกับนักเรียน": ตอนสแกน QR ที่ฐานสอบ Megacode
-- (สุ่มข้อสอบ) ระบบสุ่มเคส 1 ใน 15 แล้วบันทึกเคสนั้นติดกับนักเรียน+ฐาน —
-- สแกนซ้ำ/เปิดใบประเมินใหม่/เปลี่ยนเครื่องอาจารย์ ก็ได้โจทย์เดิมเสมอ
-- ปุ่ม "สุ่มใหม่" ส่ง p_force=true เพื่อทับเคสเดิมได้
--
-- Additive-only บน practical-checkin.sql + practical-checkin-checklists.sql:
-- คอลัมน์ nullable ใหม่ 1 คอลัมน์ + RPC ใหม่ 1 ตัว และ replace
-- checkin_student / get_checkin_board (signature เดิม) ให้คืน examCaseId
-- เพิ่ม — caller เดิมไม่กระทบ
--
-- ฝั่ง client เป็นคนสุ่ม (รายการเคสอยู่ใน src/data/checklists/megacodeCases.js)
-- ฝั่ง server แค่ "ล็อกครั้งแรกชนะ" แบบ atomic กันอาจารย์สองเครื่องสแกน
-- นักเรียนคนเดียวกันพร้อมกันแล้วได้คนละเคส
-- =====================================================

alter table public.cohort_checkins add column if not exists exam_case_id text;

-- ล็อกเคสสอบให้นักเรียนที่ฐานนี้ (สร้างแถวเช็คชื่อให้ด้วยถ้ายังไม่มี — การจ่าย
-- โจทย์สอบแปลว่านักเรียนอยู่หน้าฐานแล้ว เหมือน set_exam_result) คืนเคสที่
-- "ติดจริง": ถ้ามีเคสเดิมอยู่และไม่ force จะคืนเคสเดิม ไม่ใช่เคสที่เพิ่งส่งมา
create or replace function public.assign_exam_case(
  p_code text,
  p_student_pk uuid,
  p_station_id uuid,
  p_case_id text,
  p_force boolean default false
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_class_id uuid;
  v_case_id text;
begin
  v_class_id := _cohort_resolve_class_instructor(p_code);
  if not exists (
    select 1 from cohort_stations where id = p_station_id and class_id = v_class_id
  ) then
    raise exception 'unknown_station';
  end if;
  if not exists (
    select 1 from cohort_students where id = p_student_pk and class_id = v_class_id
  ) then
    raise exception 'unknown_student';
  end if;
  if p_case_id is null or length(trim(p_case_id)) = 0 then
    raise exception 'case_required';
  end if;

  insert into cohort_checkins (class_id, station_id, student_pk, exam_case_id)
    values (v_class_id, p_station_id, p_student_pk, trim(p_case_id))
    on conflict (student_pk, station_id) do update
      set exam_case_id = case
        when p_force then excluded.exam_case_id
        else coalesce(cohort_checkins.exam_case_id, excluded.exam_case_id)
      end
    returning exam_case_id into v_case_id;
  return v_case_id;
end;
$$;

-- replace เดิม (signature ไม่เปลี่ยน) — เพิ่ม examCaseId ในผลลัพธ์ เพื่อให้
-- หน้าเช็คชื่อรู้ทันทีตอนสแกนว่านักเรียนคนนี้ถูกล็อกเคสไหนไว้แล้ว
create or replace function public.checkin_student(
  p_code text,
  p_student_pk uuid,
  p_station_id uuid,
  p_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_class_id uuid;
  v_station cohort_stations%rowtype;
  v_student cohort_students%rowtype;
  v_row cohort_checkins%rowtype;
  v_duplicate boolean := false;
begin
  v_class_id := _cohort_resolve_class_instructor(p_code);
  select * into v_station from cohort_stations
    where id = p_station_id and class_id = v_class_id;
  if v_station.id is null then
    raise exception 'unknown_station';
  end if;
  select * into v_student from cohort_students
    where id = p_student_pk and class_id = v_class_id;
  if v_student.id is null then
    raise exception 'unknown_student';
  end if;

  insert into cohort_checkins (class_id, station_id, student_pk, note)
    values (v_class_id, p_station_id, p_student_pk, p_note)
    on conflict (student_pk, station_id) do nothing;
  if not found then
    v_duplicate := true;
  end if;
  select * into v_row from cohort_checkins
    where student_pk = p_student_pk and station_id = p_station_id;

  return jsonb_build_object(
    'duplicate', v_duplicate,
    'checkedInAt', v_row.checked_in_at,
    'examPassed', v_row.exam_passed,
    'examScore', v_row.exam_score,
    'examCaseId', v_row.exam_case_id,
    'note', v_row.note,
    'student', jsonb_build_object(
      'id', v_student.id, 'studentId', v_student.student_id, 'name', v_student.name),
    'station', jsonb_build_object(
      'id', v_station.id, 'name', v_station.name, 'kind', v_station.kind)
  );
end;
$$;

-- replace เดิม (signature ไม่เปลี่ยน) — เพิ่ม examCaseId ต่อ checkin
-- (คงฟิลด์ checklistId / checklistItems จาก practical-checkin-checklists.sql ไว้)
create or replace function public.get_checkin_board(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_class_id uuid;
  v_stations jsonb;
  v_rows jsonb;
begin
  v_class_id := _cohort_resolve_class_instructor(p_code);

  select coalesce(jsonb_agg(
      jsonb_build_object('id', st.id, 'name', st.name, 'kind', st.kind, 'sortOrder', st.sort_order)
      order by st.sort_order, st.created_at
    ), '[]'::jsonb)
    into v_stations
    from cohort_stations st
    where st.class_id = v_class_id;

  with students as (
    select id, student_id, name, phone, created_at
      from cohort_students
      where class_id = v_class_id
      order by created_at desc
  ),
  agg as (
    select
      jsonb_build_object('id', s.id, 'studentId', s.student_id, 'name', s.name, 'phone', s.phone) as student,
      coalesce(
        (
          select jsonb_object_agg(
            c.station_id,
            jsonb_build_object(
              'checkedInAt', c.checked_in_at,
              'examPassed', c.exam_passed,
              'examScore', c.exam_score,
              'examCaseId', c.exam_case_id,
              'note', c.note,
              'checklistId', c.checklist_id,
              'checklistItems', c.checklist_items
            )
          )
          from cohort_checkins c
          where c.student_pk = s.id
        ),
        '{}'::jsonb
      ) as checkins
    from students s
  )
  select coalesce(jsonb_agg(jsonb_build_object('student', student, 'checkins', checkins)), '[]'::jsonb)
    into v_rows
    from agg;

  return jsonb_build_object('stations', v_stations, 'rows', v_rows);
end;
$$;

grant execute on function public.assign_exam_case(text, uuid, uuid, text, boolean) to anon, authenticated;
grant execute on function public.checkin_student(text, uuid, uuid, text) to anon, authenticated;
grant execute on function public.get_checkin_board(text) to anon, authenticated;
