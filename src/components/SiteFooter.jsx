import {
  Hospital, BookOpen, FlaskConical, FileText, MessageSquare, HeartPulse,
  Heart, Stethoscope, Bandage, Pill, TestTube, GraduationCap, ChevronRight,
} from './ui/Icon';
import { morrooAds } from '../data/morrooAds';

// "เว็บในเครือเรา" — footer grid linking every sibling morroo.com tool,
// mirroring the network section on morroo.com. Rendered globally (App.jsx)
// at the bottom of the page flow, above the floating pill bar.

const ICONS = {
  Hospital,
  BookOpen,
  FlaskConical,
  FileText,
  MessageSquare,
  HeartPulse,
  Heart,
  Stethoscope,
  Bandage,
  Pill,
  TestTube,
  GraduationCap,
};

const TONE_VARS = {
  info:    { bg: 'rgba(37, 99, 235, 0.10)',  fg: '#2563EB' },
  purple:  { bg: 'rgba(124, 58, 237, 0.10)', fg: '#7C3AED' },
  success: { bg: 'rgba(5, 150, 105, 0.10)',  fg: '#059669' },
  warning: { bg: 'rgba(217, 119, 6, 0.10)',  fg: '#D97706' },
  shock:   { bg: 'rgba(234, 88, 12, 0.10)',  fg: '#EA580C' },
  danger:  { bg: 'rgba(220, 38, 38, 0.10)',  fg: '#DC2626' },
};

export default function SiteFooter() {
  return (
    <footer
      className="max-w-lg mx-auto px-4 pt-8"
      style={{
        // Cancel the page-container's bottom clearance (96px + safe-area) so the
        // footer sits right after the page content, then re-add clearance for the
        // floating pill bar below.
        marginTop: 'calc(-96px - env(safe-area-inset-bottom, 0px))',
        paddingBottom: 'calc(112px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      <div
        className="border-t border-bg-tertiary pt-6"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center justify-center gap-1.5 mb-4">
          <span aria-hidden="true">🌐</span>
          <span className="text-headline text-text-primary">เว็บในเครือเรา</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {morrooAds.map((site) => {
            const Icon = ICONS[site.icon] ?? Hospital;
            const tone = TONE_VARS[site.tone] ?? TONE_VARS.info;
            return (
              <a
                key={site.id}
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card flex items-center gap-2.5 hover:shadow-2 transition-shadow group no-underline"
                style={{ textDecoration: 'none', padding: '12px' }}
              >
                <div
                  className="w-9 h-9 inline-flex items-center justify-center shrink-0"
                  style={{ background: tone.bg, color: tone.fg, borderRadius: 'var(--radius)' }}
                >
                  <Icon size={18} strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-body-strong text-text-primary truncate">
                    MorRoo {site.name}
                  </div>
                  <div className="text-caption text-text-muted truncate">{site.tagline}</div>
                </div>
                <ChevronRight
                  size={16}
                  strokeWidth={2.2}
                  className="text-text-muted group-hover:text-info shrink-0 transition-colors"
                />
              </a>
            );
          })}
        </div>

        <div className="text-center text-caption text-text-muted mt-6">
          © {new Date().getFullYear()} หมอรู้ (MorRoo) — สงวนลิขสิทธิ์
        </div>
      </div>
    </footer>
  );
}
