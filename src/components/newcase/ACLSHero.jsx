import { HeartPulse, ShieldCheck, Activity } from 'lucide-react';

// Crimson gradient hero for the ACLS landing page. Mirrors the BLS hero's
// visual language but in danger/red tones and adds a small live "pulse"
// indicator on the right so the page feels alive.
export default function ACLSHero({ isClinical }) {
  return (
    <div
      className="relative overflow-hidden text-white"
      style={{
        borderRadius: 'var(--radius-2xl)',
        background:
          'linear-gradient(135deg, #F97316 0%, #DC2626 55%, #7F1D1D 100%)',
        boxShadow:
          '0 10px 30px rgba(220, 38, 38, 0.32), 0 2px 6px rgba(15, 26, 46, 0.12)',
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

      {/* EKG strip behind text */}
      <svg
        aria-hidden
        className="absolute left-0 right-0 w-full opacity-25 acls-ekg"
        style={{ bottom: 6, height: 36 }}
        viewBox="0 0 800 40"
        preserveAspectRatio="none"
      >
        <path
          d="M0 20 L180 20 L195 8 L210 32 L222 4 L235 36 L250 20 L420 20 L440 20 L455 8 L470 32 L482 4 L495 36 L510 20 L800 20"
          fill="none"
          stroke="rgba(255,255,255,0.95)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

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
          <HeartPulse size={28} strokeWidth={2.4} className="text-white animate-heartbeat" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-wider text-white/80">
            Advanced Cardiac Life Support
          </div>
          <h1 className="text-[20px] font-extrabold leading-tight tracking-tight">
            ACLS EMR
          </h1>
          <div className="inline-flex items-center gap-1.5 mt-1 text-[11px] font-semibold text-white/85">
            <ShieldCheck size={12} strokeWidth={2.6} />
            ILCOR 2025 · Code Blue Recording
          </div>
        </div>
        <div
          className="hidden xs:inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shrink-0"
          style={{
            background: 'rgba(0,0,0,0.18)',
            border: '1px solid rgba(255,255,255,0.28)',
            borderRadius: 99,
          }}
        >
          <span
            className={`w-1.5 h-1.5 ${isClinical ? 'animate-pulse' : ''}`}
            style={{ background: isClinical ? '#FCA5A5' : '#BAE6FD', borderRadius: 99 }}
          />
          {isClinical ? 'Clinical' : 'Training'}
          <Activity size={11} strokeWidth={2.6} className="text-white/85" />
        </div>
      </div>
    </div>
  );
}
