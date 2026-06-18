import { useMemo, useState, useEffect, useRef } from 'react';
import {
  Hospital, BookOpen, FlaskConical, FileText, MessageSquare, HeartPulse,
  Heart, Stethoscope, Bandage, Pill, TestTube, GraduationCap, ChevronRight,
} from './ui/Icon';
import { morrooAds } from '../data/morrooAds';

// "เว็บในเครือเรา" — footer carousel linking every sibling morroo.com tool,
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

// สลับการ์ดทุก ~5 วิ ให้เห็นเว็บในเครือครบทุกตัวแบบไม่รบกวน
const ROTATE_MS = 5000;

export default function SiteFooter() {
  const sites = useMemo(() => morrooAds, []);
  const count = sites.length;
  const [index, setIndex] = useState(0);
  const paused = useRef(false);

  // หมุนเองเฉพาะเมื่อมีหลายหน้า และผู้ใช้ไม่ได้ตั้งค่า reduce motion
  useEffect(() => {
    if (count <= 1) return undefined;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (reduce) return undefined;
    const id = setInterval(() => {
      if (!paused.current) setIndex(i => (i + 1) % count);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [count]);

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

        {/* สไลด์การ์ด: หยุดหมุนตอนเอาเมาส์ชี้ / แตะค้าง เพื่อให้อ่าน + กดได้สบาย */}
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
            {sites.map((site) => {
              const Icon = ICONS[site.icon] ?? Hospital;
              const tone = TONE_VARS[site.tone] ?? TONE_VARS.info;
              return (
                <div key={site.id} className="w-full shrink-0 px-0.5">
                  <a
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
                </div>
              );
            })}
          </div>
        </div>

        {/* จุดบอกตำแหน่ง + กดข้ามได้ (โชว์เฉพาะเมื่อมีหลายหน้า) */}
        {count > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-4">
            {sites.map((site, i) => (
              <button
                key={site.id}
                type="button"
                aria-label={`ดูเว็บ MorRoo ${site.name}`}
                onClick={() => setIndex(i)}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: i === index ? 18 : 6,
                  background: i === index ? 'var(--color-info)' : 'var(--color-border-strong, #cbd5e1)',
                }}
              />
            ))}
          </div>
        )}

        <div className="text-center text-caption text-text-muted mt-6">
          © {new Date().getFullYear()} หมอรู้ (MorRoo) — สงวนลิขสิทธิ์
        </div>
      </div>
    </footer>
  );
}
