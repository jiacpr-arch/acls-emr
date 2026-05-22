import { useEffect, useState } from 'react';
import { HeartPulse, ChevronUp } from 'lucide-react';

// Full-screen "cover" splash that greets users on first landing of the ACLS
// app. Crimson gradient, EKG-style baseline pulse, expanding rings, big
// wordmark. Tap anywhere to dismiss with a fade/zoom out.
export default function ACLSSplash({ onDismiss }) {
  const [exiting, setExiting] = useState(false);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setArmed(true), 250);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    if (!armed || exiting) return;
    setExiting(true);
    setTimeout(onDismiss, 320);
  };

  return (
    <div
      onClick={dismiss}
      role="button"
      aria-label="แตะเพื่อเริ่ม"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden cursor-pointer select-none"
      style={{
        background:
          'radial-gradient(circle at 30% 20%, #F97316 0%, #DC2626 40%, #7F1D1D 100%)',
        opacity: exiting ? 0 : 1,
        transform: exiting ? 'scale(1.04)' : 'scale(1)',
        transition: 'opacity 0.32s ease, transform 0.32s ease',
      }}
    >
      {/* Expanding rings behind the icon */}
      <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
        <span className="acls-splash-ring" style={{ animationDelay: '0s' }} />
        <span className="acls-splash-ring" style={{ animationDelay: '0.8s' }} />
        <span className="acls-splash-ring" style={{ animationDelay: '1.6s' }} />
      </div>

      {/* Soft vignette blobs */}
      <div
        aria-hidden
        className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full opacity-30"
        style={{ background: 'radial-gradient(circle, #ffffff 0%, transparent 65%)' }}
      />
      <div
        aria-hidden
        className="absolute -bottom-40 -left-32 w-[480px] h-[480px] rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #ffffff 0%, transparent 65%)' }}
      />

      {/* EKG trace across the middle — subtle, decorative */}
      <svg
        aria-hidden
        className="absolute left-0 right-0 w-full opacity-30 acls-ekg"
        style={{ top: '62%', height: 80 }}
        viewBox="0 0 800 80"
        preserveAspectRatio="none"
      >
        <path
          d="M0 40 L160 40 L200 40 L210 20 L220 60 L235 10 L250 70 L265 40 L420 40 L440 40 L450 20 L460 60 L475 10 L490 70 L505 40 L800 40"
          fill="none"
          stroke="rgba(255,255,255,0.9)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Content */}
      <div className="relative flex flex-col items-center text-white px-6 animate-splash-in">
        <div
          className="w-28 h-28 inline-flex items-center justify-center mb-6"
          style={{
            background: 'rgba(255,255,255,0.16)',
            border: '1px solid rgba(255,255,255,0.32)',
            borderRadius: 32,
            backdropFilter: 'blur(12px)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.22)',
          }}
        >
          <HeartPulse size={52} strokeWidth={2.2} className="text-white animate-heartbeat" />
        </div>

        <div className="text-[12px] font-bold uppercase tracking-[0.32em] text-white/80 mb-2">
          Advanced Cardiac Life Support
        </div>
        <h1
          className="text-[52px] font-extrabold tracking-tight leading-none drop-shadow-sm"
          style={{ fontFamily: 'inherit' }}
        >
          ACLS
        </h1>
        <div className="text-center mt-3 text-white/90 text-[15px] font-semibold max-w-[300px]">
          ระบบบันทึก code blue · สำหรับบุคลากรทางการแพทย์
        </div>
        <div
          className="mt-5 inline-flex items-center gap-2 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white"
          style={{
            background: 'rgba(255,255,255,0.14)',
            border: '1px solid rgba(255,255,255,0.28)',
            borderRadius: 99,
          }}
        >
          ILCOR 2025
        </div>
      </div>

      {/* Tap hint */}
      <div
        className="absolute bottom-12 left-0 right-0 flex flex-col items-center text-white/85 animate-tap-hint"
        aria-hidden
      >
        <ChevronUp size={18} strokeWidth={2.6} />
        <div className="text-[12px] font-bold tracking-wider mt-1">แตะเพื่อเริ่ม</div>
      </div>
    </div>
  );
}
