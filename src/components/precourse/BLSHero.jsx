import { HeartPulse, ShieldCheck } from 'lucide-react';

// Blue gradient hero for the BLS landing page. Pure visual header — the
// active-student status lives in BLSProgressCard underneath, so this stays
// uncluttered and there's no risk of cards overlapping the identity pill.
export default function BLSHero() {
  return (
    <div
      className="relative overflow-hidden text-white"
      style={{
        borderRadius: 'var(--radius-2xl)',
        background:
          'linear-gradient(135deg, #0EA5E9 0%, #2563EB 55%, #1D4ED8 100%)',
        boxShadow:
          '0 10px 30px rgba(37, 99, 235, 0.28), 0 2px 6px rgba(15, 26, 46, 0.12)',
      }}
    >
      {/* Decorative blobs */}
      <div
        aria-hidden
        className="absolute -top-16 -right-12 w-48 h-48 rounded-full opacity-25"
        style={{ background: 'radial-gradient(circle, #ffffff 0%, transparent 70%)' }}
      />
      <div
        aria-hidden
        className="absolute -bottom-20 -left-10 w-56 h-56 rounded-full opacity-15"
        style={{ background: 'radial-gradient(circle, #ffffff 0%, transparent 70%)' }}
      />

      <div className="relative px-5 py-6 flex items-center gap-3">
        <div
          className="w-14 h-14 inline-flex items-center justify-center shrink-0"
          style={{
            borderRadius: 'var(--radius-xl)',
            background: 'rgba(255,255,255,0.18)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.25)',
          }}
        >
          <HeartPulse size={28} strokeWidth={2.4} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-wider text-white/80">
            Basic Life Support
          </div>
          <h1 className="text-[20px] font-extrabold leading-tight tracking-tight">
            BLS for Healthcare Providers
          </h1>
          <div className="inline-flex items-center gap-1.5 mt-1 text-[11px] font-semibold text-white/85">
            <ShieldCheck size={12} strokeWidth={2.6} />
            AHA 2020 · ใบประกาศใช้ได้ 24 เดือน
          </div>
        </div>
      </div>
    </div>
  );
}
