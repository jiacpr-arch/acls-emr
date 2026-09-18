// เรียก API สาธารณะของระบบจองกลาง class.morroo.com (repo JIA-CLASS, edge function bcpr-api)
// เพื่อโชว์ "รอบเรียนที่เปิดจอง" ในแบนเนอร์คอร์ส — สัญญา API: docs/WIDGET-API.md ใน repo JIA-CLASS
// ใน sandbox/remote Supabase เชื่อมต่อไม่ได้ (ติด proxy) — ทุก error ต้องจบเงียบๆ ที่ null
// เพื่อให้ UI fallback เป็นแบนเนอร์ CTA LINE/โทร แบบเดิม

const HUB_API = 'https://tpoiyykbgsgnrdwzgzvn.supabase.co/functions/v1/bcpr-api';
// anon key สาธารณะของโปรเจกต์ jia-unified — ตัวเดียวกับที่ฝังอยู่ใน booking.html ของ class.morroo.com
const HUB_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwb2l5eWtiZ3NnbnJkd3pnenZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2NTUwMDIsImV4cCI6MjA5MDIzMTAwMn0.c7Ow_20mpmcDqDdMQ5qnsDV6-RKAO-7-eM1y-EsEXdA';
const BOOKING_PAGE = 'https://class.morroo.com/booking.html';
const FETCH_TIMEOUT_MS = 4000;

// ทะเบียน utm_source ต่อ build (ดู WIDGET-API.md) — ให้ทีมขายรู้ว่าลูกค้ามาจากแอปไหน
const MODE = import.meta.env.VITE_COURSE_MODE || 'acls';
export const UTM_SOURCE = `${MODE}-app`;

let cache = null; // Promise — ยิงครั้งเดียวต่อการโหลดแอป ทุกแบนเนอร์ใช้ผลร่วมกัน

// คืน array ของรอบเรียน [{class_id, course_key, label, price, date, time_slot, place, seats_left}]
// หรือ null เมื่อเรียกไม่สำเร็จ (ห้าม throw)
export function fetchUpcoming() {
  if (!cache) {
    cache = (async () => {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
      try {
        const res = await fetch(HUB_API, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${HUB_ANON}`,
            apikey: HUB_ANON,
          },
          body: JSON.stringify({ action: 'list_upcoming' }),
          signal: ctrl.signal,
        });
        const data = await res.json();
        return data && data.ok && Array.isArray(data.classes) ? data.classes : null;
      } catch {
        return null;
      } finally {
        clearTimeout(timer);
      }
    })();
  }
  return cache;
}

// รอบที่ใกล้ที่สุดของคอร์สนี้ที่ยังมีที่ว่าง (list_upcoming เรียงวันที่ให้แล้ว)
export function nextClassFor(classes, courseKey) {
  if (!classes || !courseKey) return null;
  return classes.find(c => c.course_key === courseKey && c.seats_left > 0) || null;
}

export function bookingUrl(courseKey, classId) {
  const q = new URLSearchParams({ course: courseKey, utm_source: UTM_SOURCE });
  if (classId) q.set('class_id', classId);
  return `${BOOKING_PAGE}?${q.toString()}`;
}

const TH_MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

// 2026-08-22 → "22 ส.ค. 69"
export function thShortDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso ?? ''));
  if (!m) return String(iso ?? '');
  return `${Number(m[3])} ${TH_MONTHS[Number(m[2]) - 1]} ${(Number(m[1]) + 543) % 100}`;
}
