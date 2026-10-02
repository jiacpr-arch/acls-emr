import { useState } from 'react';
import { LogIn, LogOut, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';
import StudentIdentityModal from './StudentIdentityModal';
import { usePassport } from '../../hooks/usePassport';
import { usePreCourseStore } from '../../stores/preCourseStore';
import { startPassportLogin, logoutPassport } from '../../services/passport';

// The JIA account (Hub passport) in plain sight on the lessons and certificate pages — before, the
// only way in was a button inside the "identify learner" popup. Logged out: a login button (LINE or
// email, at class.jiacpr.com). Logged in: who it is, "use this account for this learner" when the
// learner on this device isn't linked yet, and "log out", which also ends the JIA session at the Hub
// so the next person on a shared device must log in again. Nothing on a site without JIA login.
export default function JiaAccountCard() {
  const passport = usePassport();
  const activeStudent = usePreCourseStore(s => s.activeStudent);
  const [showIdentity, setShowIdentity] = useState(false);
  const [leaving, setLeaving] = useState(false);
  if (!passport.loaded || !passport.configured) return null;

  if (!passport.loggedIn) {
    return (
      <div className="dash-card space-y-2" data-testid="jia-account-card" data-state="signed-out">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 inline-flex items-center justify-center bg-info/12 text-info shrink-0"
            style={{ borderRadius: 'var(--radius-md)' }}>
            <ShieldCheck size={18} strokeWidth={2.2} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-body-strong text-text-primary">บัญชี JIA</div>
            <div className="text-2xs text-text-muted">
              เข้าสู่ระบบด้วย LINE หรืออีเมล (บัญชีเดียวกับ class.jiacpr.com) — ผลสอบและใบประกาศจะใช้ชื่อจริงบนบัตรนักเรียน
            </div>
          </div>
        </div>
        {passport.returnFlag === 'error' && (
          <div className="bg-warning/10 border border-warning/30 p-2 text-caption inline-flex items-center gap-2 w-full"
            style={{ borderRadius: 'var(--radius-md)' }}>
            <AlertCircle size={14} strokeWidth={2.2} /> เข้าสู่ระบบบัญชี JIA ไม่สำเร็จ — ลองใหม่อีกครั้ง
          </div>
        )}
        <button type="button" onClick={() => startPassportLogin()} className="btn btn-primary btn-md btn-block">
          <LogIn size={16} strokeWidth={2.4} /> เข้าสู่ระบบด้วยบัญชี JIA
        </button>
      </div>
    );
  }

  const profile = passport.profile || {};
  const linked = activeStudent?.hubSub && activeStudent.hubSub === profile.sub;
  return (
    <div className="dash-card space-y-2 bg-success/8 border border-success/30" data-testid="jia-account-card" data-state="signed-in">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 inline-flex items-center justify-center bg-success/15 text-success shrink-0"
          style={{ borderRadius: 'var(--radius-md)' }}>
          <UserCheck size={18} strokeWidth={2.2} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-2xs text-text-muted">เข้าสู่ระบบบัญชี JIA แล้ว</div>
          <div className="text-body-strong text-text-primary truncate">{(profile.nameTh || '').trim() || 'บัญชี JIA'}</div>
          <div className="text-2xs text-text-muted">
            {profile.cardNo ? `บัตรนักเรียน ${profile.cardNo}` : 'บัญชี JIA'}
            {linked ? ' · ผูกกับผู้เรียนในเครื่องนี้แล้ว' : ''}
          </div>
        </div>
      </div>
      {!linked && (
        <button type="button" onClick={() => setShowIdentity(true)} className="btn btn-primary btn-sm btn-block">
          <UserCheck size={14} strokeWidth={2.4} /> ใช้บัญชีนี้กับผู้เรียนในเครื่องนี้
        </button>
      )}
      <button type="button" disabled={leaving}
        onClick={() => { setLeaving(true); logoutPassport({ everywhere: true }).finally(() => setLeaving(false)); }}
        className="btn btn-ghost btn-sm btn-block">
        <LogOut size={14} strokeWidth={2.4} /> {leaving ? 'กำลังออกจากระบบ…' : 'ออกจากระบบ'}
      </button>
      <StudentIdentityModal open={showIdentity} onClose={() => setShowIdentity(false)} onConfirm={() => setShowIdentity(false)} />
    </div>
  );
}
