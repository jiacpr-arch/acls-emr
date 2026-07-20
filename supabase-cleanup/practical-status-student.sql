-- Migration: practical_status_student
--
-- ให้เครื่องนักเรียนอ่าน "สถานะภาคปฏิบัติของตัวเอง" ได้ (เข้าฐานไหนแล้ว /
-- สอบผ่านหรือยัง) เพื่อให้หน้าใบประกาศนียบัตรอัปเกรดใบทฤษฎี (ออนไลน์) เป็น
-- ฉบับสมบูรณ์อัตโนมัติเมื่อเข้าครบทุกฐาน + สอบปฏิบัติผ่านครบ
--
-- ความปลอดภัย: resolve คลาสด้วย "รหัสเข้าคลาสของนักเรียน" (ไม่ใช่รหัสอาจารย์)
-- และคืนเฉพาะแถวของ p_student_pk ที่ต้องอยู่ในคลาสนั้นจริงเท่านั้น — ไม่มีทาง
-- เห็นข้อมูลนักเรียนคนอื่น (แพทเทิร์นเดียวกับ RPC ฝั่งนักเรียนตัวอื่น เช่น
-- join_class ใน cohort-sync.sql)

create or replace function public.get_my_practical_status(p_code text, p_student_pk uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_class_id uuid;
  v_stations jsonb;
begin
  v_class_id := _cohort_resolve_class(p_code);

  if not exists (
    select 1 from cohort_students
    where id = p_student_pk and class_id = v_class_id
  ) then
    raise exception 'unknown_student' using errcode = 'P0001';
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
      'id', st.id,
      'name', st.name,
      'kind', st.kind,
      'sortOrder', st.sort_order,
      'checkedInAt', c.checked_in_at,
      'examPassed', c.exam_passed
    ) order by st.sort_order, st.created_at), '[]'::jsonb)
  into v_stations
  from cohort_stations st
  left join cohort_checkins c
    on c.station_id = st.id and c.student_pk = p_student_pk
  where st.class_id = v_class_id;

  return jsonb_build_object('stations', v_stations);
end;
$$;

grant execute on function public.get_my_practical_status(text, uuid) to anon, authenticated;
