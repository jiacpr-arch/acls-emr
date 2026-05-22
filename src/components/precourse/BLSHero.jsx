import { HeartPulse, User, UserCheck, RefreshCw, ShieldCheck } from 'lucide-react';

// Blue gradient hero for the BLS landing page. Replaces the small icon+title
// header with a punchier banner that doubles as the active-student banner.
export default function BLSHero({ activeStudent, onChangeStudent, onIdentify }) {
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

      <div className="relative px-5 pt-6 pb-5">
        <div className="flex items-start gap-3">
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
            <h1 className="text-[22px] font-extrabold leading-tight tracking-tight">
              BLS for Healthcare<br />Providers
            </h1>
            <div className="inline-flex items-center gap-1.5 mt-1.5 text-[11px] font-semibold text-white/85">
              <ShieldCheck size={12} strokeWidth={2.6} />
              AHA 2020 · ใบประกาศใช้ได้ 24 เดือน
            </div>
          </div>
        </div>

        {/* Active-student pill */}
        <div
          className="mt-4 flex items-center gap-2.5 px-3 py-2"
          style={{
            background: 'rgba(255,255,255,0.16)',
            border: '1px solid rgba(255,255,255,0.22)',
            borderRadius: 'var(--radius-lg)',
            backdropFilter: 'blur(8px)',
          }}
        >
          {activeStudent ? (
            <>
              <div
                className="w-8 h-8 inline-flex items-center justify-center shrink-0 bg-white text-info"
                style={{ borderRadius: 'var(--radius-full)' }}
              >
                <UserCheck size={16} strokeWidth={2.4} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold truncate">{activeStudent.name}</div>
                <div className="text-[10px] text-white/80 font-mono">
                  รหัส {activeStudent.studentId}
                </div>
              </div>
              <button
                onClick={onChangeStudent}
                className="text-[11px] font-bold inline-flex items-center gap-1 px-2.5 py-1.5 text-white"
                style={{
                  background: 'rgba(255,255,255,0.18)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: 99,
                }}
              >
                <RefreshCw size={11} strokeWidth={2.4} /> เปลี่ยน
              </button>
            </>
          ) : (
            <>
              <div
                className="w-8 h-8 inline-flex items-center justify-center shrink-0"
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                <User size={16} strokeWidth={2.4} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold">ยังไม่ได้ระบุตัวผู้เรียน</div>
                <div className="text-[10px] text-white/80">ใส่ชื่อก่อนเริ่ม เพื่อบันทึกผล</div>
              </div>
              <button
                onClick={onIdentify}
                className="text-[11px] font-bold px-3 py-1.5 bg-white text-info"
                style={{ borderRadius: 99 }}
              >
                ระบุตัวตน
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
