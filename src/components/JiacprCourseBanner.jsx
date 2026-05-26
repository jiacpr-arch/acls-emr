import { useMemo } from 'react';
import { GraduationCap, MessageSquare, Phone } from './ui/Icon';
import { jiacprCourse, pickRandomJiaCourse } from '../data/jiacprCourse';

export default function JiacprCourseBanner() {
  const course = useMemo(() => pickRandomJiaCourse(), []);

  return (
    <div
      className="dash-card border-l-4 border-l-success animate-slide-up"
      style={{ boxShadow: 'var(--shadow-2)' }}
    >
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
            <span className="text-overline text-text-muted">{course.group}</span>
          </div>
          <div className="text-body-strong text-text-primary mt-0.5">{course.name}</div>
          <div className="text-caption text-text-secondary mt-0.5">{course.titleTh}</div>
          <div className="text-caption text-text-muted mt-1">{course.desc}</div>
          <div className="text-overline text-text-muted mt-1.5">{course.meta}</div>
        </div>
      </div>

      <div className="text-caption text-text-muted mt-3">
        ติดต่อสอบถาม / สมัครเรียน · {jiacprCourse.orgName}
      </div>

      <div className="grid grid-cols-2 gap-3 mt-2">
        <a
          href={jiacprCourse.lineUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-success btn-block no-underline"
          style={{ textDecoration: 'none' }}
        >
          <MessageSquare size={16} strokeWidth={2.4} /> แชท LINE
        </a>
        <a
          href={`tel:${jiacprCourse.phone}`}
          className="btn btn-info btn-block no-underline"
          style={{ textDecoration: 'none' }}
        >
          <Phone size={16} strokeWidth={2.4} /> โทร {jiacprCourse.phoneDisplay}
        </a>
      </div>
    </div>
  );
}
