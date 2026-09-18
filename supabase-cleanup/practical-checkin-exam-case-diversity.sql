-- =====================================================
-- Migration: practical_checkin_exam_case_diversity
-- Project: emr-ai-clinic (elyyijlcjfvhxbpzscnv)
--
-- ปัญหา: ฐานสอบ "สอบ Megacode (สุ่มข้อสอบ)" ล็อกเคสกับนักเรียนแล้ว (ดู
-- practical-checkin-exam-case.sql) แต่การ "สุ่ม" เคสยังทำฝั่ง client ด้วย
-- Math.random() ธรรมดา — นักเรียนในรุ่นเดียวกันจึงมีโอกาสได้เคสซ้ำกับเพื่อนที่
-- สอบไปก่อนแล้ว จำโจทย์กันได้ ทำให้สอบง่ายเกินไป (ตามที่อาจารย์แจ้ง)
--
-- แก้: ย้ายการ "เลือกเคส" มาทำฝั่ง server ใน assign_exam_case แทน — เลือกเคส
-- ที่ถูกใช้ "น้อยที่สุด" ในฐานเดียวกันของคลาสนี้ก่อนเสมอ (สุ่มในกลุ่มที่เสมอกัน)
-- ทำให้ต้องหมุนครบทั้งธนาคารข้อสอบก่อนถึงจะเริ่มมีเคสซ้ำ และปุ่ม "สุ่มใหม่"
-- (force=true) จะกันไม่ให้สุ่มเจอเคสเดิมของตัวเองซ้ำ (ถ้ามีตัวเลือกอื่นเหลือ)
--
-- Breaking change ที่ตั้งใจ: p_case_id (text) -> p_case_ids (text[]) — ฝั่ง
-- client ต้องส่งเคสทั้ง pool มาให้ server เลือก ไม่ใช่เคสเดียวที่สุ่มมาเองแล้ว
-- (ดู src/services/cohortSync.js rpcAssignExamCase + ChecklistGrader.jsx)
-- กติกา "เคสแรกชนะ" ต่อนักเรียนคนเดิมยังเหมือนเดิม เปลี่ยนแค่วิธีเลือกเคสใหม่
-- ตอนที่ยังไม่เคยล็อก (หรือตอน force reroll)
-- =====================================================

drop function if exists public.assign_exam_case(text, uuid, uuid, text, boolean);

create or replace function public.assign_exam_case(
  p_code text,
  p_student_pk uuid,
  p_station_id uuid,
  p_case_ids text[],
  p_force boolean default false
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_class_id uuid;
  v_existing text;
  v_candidates text[];
  v_pick text;
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
  if p_case_ids is null or array_length(p_case_ids, 1) is null then
    raise exception 'case_required';
  end if;

  -- serialize concurrent assignments ที่ฐานนี้ — กันสองอาจารย์/สองนักเรียน
  -- แย่งกันได้เคส "น้อยสุด" เคสเดียวกันพร้อมกัน
  perform pg_advisory_xact_lock(hashtextextended(p_station_id::text, 0));

  select exam_case_id into v_existing
    from cohort_checkins
    where student_pk = p_student_pk and station_id = p_station_id;

  -- เคสแรกชนะ: มีล็อกไว้แล้วและไม่ force คืนเคสเดิม ไม่เลือกใหม่
  if v_existing is not null and not p_force then
    return v_existing;
  end if;

  -- reroll (force): ตัดเคสเดิมของตัวเองออกจากตัวเลือกถ้ายังมีเคสอื่นให้เลือก
  -- เพื่อให้ "สุ่มใหม่" เปลี่ยนเคสจริงๆ ไม่ใช่ได้เคสเดิมซ้ำ
  select array_agg(x) into v_candidates from unnest(p_case_ids) as x
    where not (p_force and v_existing is not null and x = v_existing and array_length(p_case_ids, 1) > 1);
  if v_candidates is null or array_length(v_candidates, 1) = 0 then
    v_candidates := p_case_ids;
  end if;

  -- เลือกเคสที่ถูกใช้น้อยที่สุดในฐานนี้ (นับจากนักเรียนคนอื่น ไม่รวมตัวเอง)
  -- เสมอกันสุ่มเลือก — กระจายเคสทั่วรุ่นก่อนเริ่มซ้ำ
  select c.case_id into v_pick
    from unnest(v_candidates) as c(case_id)
    left join (
      select exam_case_id, count(*) as used
        from cohort_checkins
        where station_id = p_station_id
          and student_pk <> p_student_pk
          and exam_case_id is not null
        group by exam_case_id
    ) u on u.exam_case_id = c.case_id
    order by coalesce(u.used, 0) asc, random()
    limit 1;

  insert into cohort_checkins (class_id, station_id, student_pk, exam_case_id)
    values (v_class_id, p_station_id, p_student_pk, v_pick)
    on conflict (student_pk, station_id) do update
      set exam_case_id = excluded.exam_case_id
    returning exam_case_id into v_case_id;
  return v_case_id;
end;
$$;

grant execute on function public.assign_exam_case(text, uuid, uuid, text[], boolean) to anon, authenticated;
