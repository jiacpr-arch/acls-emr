import { useMemo } from 'react';
import {
  Hospital, BookOpen, FlaskConical, FileText, MessageSquare, ChevronRight,
} from './ui/Icon';
import { pickRandomAd } from '../data/morrooAds';

const ICONS = {
  Hospital,
  BookOpen,
  FlaskConical,
  FileText,
  MessageSquare,
};

const TONE_VARS = {
  info:    { bg: 'rgba(37, 99, 235, 0.10)',  fg: '#2563EB' },
  purple:  { bg: 'rgba(124, 58, 237, 0.10)', fg: '#7C3AED' },
  success: { bg: 'rgba(5, 150, 105, 0.10)',  fg: '#059669' },
  warning: { bg: 'rgba(217, 119, 6, 0.10)',  fg: '#D97706' },
  shock:   { bg: 'rgba(234, 88, 12, 0.10)',  fg: '#EA580C' },
};

export default function MorrooAdCard() {
  const ad = useMemo(() => pickRandomAd(), []);
  const Icon = ICONS[ad.icon] ?? Hospital;
  const tone = TONE_VARS[ad.tone] ?? TONE_VARS.info;

  return (
    <a
      href={ad.url}
      target="_blank"
      rel="noopener noreferrer"
      className="glass-card flex items-center gap-3 hover:shadow-2 transition-shadow group no-underline"
      style={{ textDecoration: 'none' }}
    >
      <div
        className="w-10 h-10 inline-flex items-center justify-center shrink-0"
        style={{ background: tone.bg, color: tone.fg, borderRadius: 'var(--radius)' }}
      >
        <Icon size={20} strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-overline text-text-muted">แนะนำ</span>
          <span className="text-overline text-text-muted opacity-50">·</span>
          <span className="text-overline" style={{ color: tone.fg }}>{ad.name}</span>
        </div>
        <div className="text-body-strong text-text-primary truncate mt-0.5">{ad.tagline}</div>
      </div>
      <ChevronRight
        size={18}
        strokeWidth={2.2}
        className="text-text-muted group-hover:text-info shrink-0 transition-colors"
      />
    </a>
  );
}
