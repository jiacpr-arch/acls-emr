import { useMemo, useState, useEffect, useRef } from 'react';
import { GraduationCap, MessageSquare, Phone } from './ui/Icon';
import { jiacprCourse, pickJiaCourse, jiaCourses } from '../data/jiacprCourse';
import { IS_BLS } from '../config/courseMode';
import { track } from '../services/analytics';

// สลับการ์ดทุก ~5 วิ ให้เห็นคอร์สหลายตัวแบบไม่รบกวน
const ROTATE_MS = 5000;

// courseId: บังคับโชว์คอร์สที่ตรงบริบทหน้า (เช่น หน้าคำนวณยา → acls-drug) — กรณีนี้ไม่หมุน
// group: กรองกลุ่มคอร์ส — ค่า default โหมด BLS โชว์เฉพาะกลุ่ม BLS/CPR
// ถ้ามีหลายคอร์สในกลุ่ม จะกลายเป็น carousel หมุนสไลด์เองอัตโนมัติ
export default function JiacprCourseBanner({ courseId, group }) {
  const pool = useMemo(() => {
    // หน้าที่ล็อกคอร์สตามบริบท → โชว์ตัวเดียว ไม่หมุน
    if (courseId) {
      const found = jiaCourses.find(c => c.id === courseId);
      if (found) return [found];
    }
    const g = group ?? (IS_BLS ? 'BLS / CPR & AED' : undefined);
    const list = g ? jiaCourses.filter(c => c.group === g) : jiaCourses;
    return list.length ? list : [pickJiaCourse({ courseId, group })];
  }, [courseId, group]);

  const count = pool.length;
  const [index, setIndex] = useState(0);
  const paused = useRef(false);

  // หมุนเองเฉพาะเมื่อมีหลายใบ และผู้ใช้ไม่ได้ตั้งค่า reduce motion
  useEffect(() => {
    if (count <= 1) return undefined;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (reduce) return undefined;
    const id = setInterval(() => {
      if (!paused.current) setIndex(i => (i + 1) % count);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [count]);

  const course = pool[Math.min(index, count - 1)] ?? pool[0];

  return (
    <div
      className="dash-card border-l-4 border-l-success animate-slide-up"
      style={{ boxShadow: 'var(--shadow-2)' }}
    >
      {/* สไลด์คอร์ส: หยุดหมุนตอนเอาเมาส์ชี้ / แตะค้าง เพื่อให้อ่าน + กดได้สบาย */}
      <div
        className="overflow-hidden"
        onMouseEnter={() => { paused.current = true; }}
        onMouseLeave={() => { paused.current = false; }}
        onTouchStart={() => { paused.current = true; }}
        onTouchEnd={() => { paused.current = false; }}
      >
        <div
          className="flex"
          style={{
            transform: `translateX(-${index * 100}%)`,
            transition: 'transform 480ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {pool.map(c => (
            <div key={c.id} className="w-full shrink-0">
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 inline-flex items-center justify-center shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, var(--color-success) 0%, var(--color-info) 100%)',
                    color: '#fff',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <GraduationCap size={20} strokeWidth={2.4} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-overline text-success">คอร์สอบรมหน้างานจริง</span>
                    <span className="text-overline text-text-muted opacity-50">·</span>
                    <span className="text-overline text-text-muted">{c.group}</span>
                  </div>
                  <div className="text-body-strong text-text-primary mt-0.5">{c.name}</div>
                  <div className="text-caption text-text-secondary mt-0.5">{c.titleTh}</div>
                  <div className="text-caption text-text-muted mt-1">{c.desc}</div>
                  <div className="text-overline text-text-muted mt-1.5">{c.meta}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* จุดบอกตำแหน่ง + กดข้ามได้ (โชว์เฉพาะเมื่อมีหลายใบ) */}
      {count > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {pool.map((c, i) => (
            <button
              key={c.id}
              type="button"
              aria-label={`ดูคอร์ส ${c.name}`}
              onClick={() => setIndex(i)}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: i === index ? 18 : 6,
                background: i === index ? 'var(--color-success)' : 'var(--color-border-strong, #cbd5e1)',
              }}
            />
          ))}
        </div>
      )}

      <div className="text-caption text-text-muted mt-3">
        ติดต่อสอบถาม / สมัครเรียน · {jiacprCourse.orgName}
      </div>

      <div className="grid grid-cols-2 gap-3 mt-2">
        <a
          href={jiacprCourse.lineUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track('contact_click', {
            meta: 'Contact',
            props: { channel: 'line', source: 'jiacpr_banner', course_id: course.id, value: 2500, currency: 'THB' },
          })}
          className="btn btn-success btn-block no-underline"
          style={{ textDecoration: 'none' }}
        >
          <MessageSquare size={16} strokeWidth={2.4} /> แชท LINE
        </a>
        <a
          href={`tel:${jiacprCourse.phone}`}
          onClick={() => track('contact_click', {
            meta: 'Contact',
            props: { channel: 'phone', source: 'jiacpr_banner', course_id: course.id, value: 2500, currency: 'THB' },
          })}
          className="btn btn-info btn-block no-underline"
          style={{ textDecoration: 'none' }}
        >
          <Phone size={16} strokeWidth={2.4} /> โทร {jiacprCourse.phoneDisplay}
        </a>
      </div>

      <div className="text-center mt-2">
        <a
          href={jiacprCourse.courseUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track('course_page_click', {
            props: { source: 'jiacpr_banner', course_id: course.id },
          })}
          className="text-caption text-text-muted underline"
        >
          ดูคอร์สทั้งหมดที่ jiacpr.com →
        </a>
      </div>
    </div>
  );
}
