import { GraduationCap, MessageSquare, Phone, ChevronRight } from './ui/Icon';
import { jiacprCourse } from '../data/jiacprCourse';

export default function JiacprCourseBanner() {
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
          <div className="text-overline text-success">เรียน ACLS หน้างานจริง</div>
          <div className="text-body-strong text-text-primary mt-0.5">{jiacprCourse.headline}</div>
          <div className="text-caption text-text-muted mt-0.5">{jiacprCourse.subline}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
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

      <a
        href={jiacprCourse.website}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-1 text-caption font-semibold text-info hover:underline"
        style={{ textDecoration: 'none' }}
      >
        ดูตารางและราคา
        <ChevronRight size={14} strokeWidth={2.4} />
      </a>
    </div>
  );
}
