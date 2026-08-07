import { useEffect, useState } from 'react';
import { hydrateStudentProgress } from '../db/database';
import { useClassStore, getClassContext } from '../stores/classStore';
import { usePreCourseStore } from '../stores/preCourseStore';
import { rpcGetStudentProgress } from './cohortSync';
import { restoreCodeBlueProgress, restoreRecorderProgress } from '../game/progressSync';

// ขาลงของ sync (cloud → เครื่องนี้) — คู่กับ syncEngine.js ที่ทำแต่ขาขึ้น
//
// เดิมการดึงข้อมูลกลับมีที่เดียวในแอปทั้งหมด: ตอนกด "ยืนยัน" ใน
// StudentIdentityModal เท่านั้น เครื่องที่ลงทะเบียนไว้แล้วจึงไม่มีวันเห็นผลที่
// ทำจากอีกเครื่อง (เรียน/เล่นบน iPhone แล้วเปิด iPad ไม่เจอกัน) ไฟล์นี้ย้ายมัน
// มาเป็นงานประจำ: ดึงตอนเปิดแอป, ตอนกลับมาโฟกัส และตอนเน็ตกลับมา
//
// เป็น merge ล้วน ไม่ทับของในเครื่อง — เครื่องอาจมีผลที่ยังไม่ถูก flush ขึ้นไป
// (เล่นออฟไลน์/ส่งพลาด) hydrateStudentProgress กันซ้ำด้วย [studentId+lessonId]
// กับ uuid ของ attempt ส่วน restoreCodeBlueProgress ใช้ union/ค่าที่ดีกว่าชนะ
//
// best-effort ล้วน: ไม่มีคลาส/ออฟไลน์/RPC error = ไม่ดึง ไม่แจ้ง ไม่บล็อกอะไร
// (ต่างจากขาขึ้นที่ต้องมี queue+retry เพราะข้อมูลจะหายถ้าไม่ส่ง — ขาลงพลาด
// รอบนี้ก็แค่ดึงรอบหน้า)

// กันยิงรัวตอนสลับแท็บไปมา — focus กับ visibilitychange มาพร้อมกันเป็นชุด
const MIN_INTERVAL_MS = 3 * 60_000;

let pulling = false;
let lastPullAt = 0;
const subscribers = new Set();

function notify() {
  subscribers.forEach(fn => {
    try { fn(); } catch { /* ignore */ }
  });
}

// แจ้งเมื่อมีข้อมูลใหม่ลงเครื่องจริงๆ เท่านั้น (ไม่ใช่ทุกครั้งที่ยิง RPC) —
// หน้าที่โชว์ความคืบหน้า subscribe ไว้แล้วโหลดใหม่ ไม่ต้องรอ remount
export function subscribeToPull(fn) {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

// ตัวนับสำหรับหน้าที่ดึงข้อมูลผ่าน useAsyncData — ใส่ใน deps แล้วมันจะ refetch
// ให้เอง (ทางลัดของ subscribeToPull สำหรับ component ที่ไม่มี load() แยก)
export function usePullTick() {
  const [tick, setTick] = useState(0);
  useEffect(() => subscribeToPull(() => setTick(n => n + 1)), []);
  return tick;
}

export async function pullRemoteProgress({ force = false } = {}) {
  const { classCode, syncDisabled } = getClassContext();
  const student = usePreCourseStore.getState().activeStudent;
  // ไม่มีคลาส = ไม่มีอะไรบน cloud ให้ดึง (ทุก RPC ตอบ no_class อยู่แล้ว)
  if (!classCode || syncDisabled || !student?.id) return false;
  if (pulling) return false;
  if (!force && Date.now() - lastPullAt < MIN_INTERVAL_MS) return false;

  pulling = true;
  let changed = false;
  try {
    // บทเรียน + ผลควิซ — ต้องมีรหัสนักเรียน/รหัสผู้เล่นเพราะ server ใช้มันหาแถว
    // (คนที่ลงทะเบียนด้วยชื่อเปล่าๆ ไม่มีตัวตนบน cloud ให้ดึงกลับ)
    if (student.studentId) {
      const { data } = await rpcGetStudentProgress({
        code: classCode,
        studentId: student.studentId,
      });
      if (data?.student) {
        const added = await hydrateStudentProgress(student.id, {
          lessonProgress: data.lessonProgress,
          quizAttempts: data.quizAttempts,
        });
        if (added > 0) changed = true;
      }
    }
    // เกม Code Blue: เคสที่ผ่าน / เกรด / hi-score (bearer = รหัสคลาส + pk)
    if (await restoreCodeBlueProgress(student.id)) changed = true;
    // Recorder Hero: ดาว+hi-score ต่อด่าน และ hi-score ของ Endless ต่อหมวด
    if (await restoreRecorderProgress(student.id)) changed = true;
  } catch { /* best-effort — รอบหน้าค่อยว่ากัน */ }
  finally {
    lastPullAt = Date.now();
    pulling = false;
  }

  if (changed) notify();
  return changed;
}

// React mount hook — คู่กับ useSyncEngine() ใน App.jsx
// ดึงทันทีเมื่อรู้ว่าใครเล่น/อยู่คลาสไหน แล้วดึงซ้ำแบบ throttle ตอนกลับมาโฟกัส
export function usePullEngine() {
  const studentPk = usePreCourseStore(s => s.activeStudent?.id);
  const classCode = useClassStore(s => s.classCode);

  useEffect(() => {
    if (!studentPk || !classCode) return;

    // เพิ่งเปิดแอป / เพิ่งระบุตัว / เพิ่งเข้าคลาส — ดึงเลยไม่ต้องรอ throttle
    pullRemoteProgress({ force: true });

    const onFocus = () => pullRemoteProgress();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') pullRemoteProgress();
    };
    // ออฟไลน์อยู่แล้วเน็ตกลับมา = รอบก่อนหน้าน่าจะ fail ข้าม throttle ไปเลย
    const onOnline = () => pullRemoteProgress({ force: true });

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('online', onOnline);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('online', onOnline);
    };
  }, [studentPk, classCode]);
}
