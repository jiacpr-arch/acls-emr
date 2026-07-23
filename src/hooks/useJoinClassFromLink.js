import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useClassStore } from '../stores/classStore';
import { COURSE_MODE } from '../config/courseMode';
import { rpcVerifyClassCode } from '../services/cohortSync';
import { scheduleFlush } from '../services/syncEngine';
import { track } from '../services/analytics';

// ลิงก์ตรงเข้าบทเรียน/ข้อสอบ: /pre-course/<lessonId>?join=CODE
// อาจารย์แชร์ลิงก์นี้ให้นักเรียน → กดแล้วเข้าหน้าบทเรียนทันที ไม่ผ่านหน้าแรก
// hook นี้เข้าคลาสให้เบื้องหลังแบบเงียบ (ต่างจาก /pre-course?join= ที่เปิด
// modal ให้กดยืนยัน) เพราะจุดขายของลิงก์ตรงคือ zero-friction
// ถ้า join ไม่สำเร็จ (โค้ดผิด/ออฟไลน์) ไม่บล็อกการเรียน — ผลถูกเก็บในเครื่อง
// และจะ flush ขึ้น cloud เมื่อเข้าคลาสสำเร็จภายหลัง (syncEngine ทำอยู่แล้ว)
export function useJoinClassFromLink() {
  const [searchParams] = useSearchParams();
  const joinParam = (searchParams.get('join') || '').trim().toUpperCase();

  useEffect(() => {
    if (!joinParam) return;
    if (useClassStore.getState().classCode === joinParam) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await rpcVerifyClassCode(joinParam);
      if (cancelled || error || !data) return;
      if (data.courseMode !== COURSE_MODE) return;
      useClassStore.getState().setClass({
        classId: data.classId,
        classCode: joinParam,
        className: data.className,
        courseMode: data.courseMode,
      });
      track('class_joined', { props: { via: 'lesson_link' } });
      scheduleFlush();
    })();
    return () => { cancelled = true; };
  }, [joinParam]);
}
