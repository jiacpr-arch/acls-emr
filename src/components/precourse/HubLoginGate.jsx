import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import StudentIdentityModal from './StudentIdentityModal';
import LoadingCard from '../ui/LoadingCard';
import { startPassportLogin } from '../../services/passport';

// Shown instead of the exam / certificate form while useHubLoginGate() blocks (see there).
// `action` finishes the sentence "คลาสนี้ต้องเข้าสู่ระบบบัญชี JIA ก่อน…".
export default function HubLoginGate({ gate, action }) {
  const [showIdentity, setShowIdentity] = useState(false);
  if (gate.reason === 'loading') return <LoadingCard label="กำลังตรวจสอบบัญชี JIA..." />;
  const name = (gate.passport.profile?.nameTh || '').trim();
  return (
    <div className="dash-card text-center !p-6 space-y-3" data-testid="hub-login-gate">
      <ShieldCheck size={32} className="mx-auto text-info" />
      <div className="text-headline">คลาสนี้ต้องเข้าสู่ระบบบัญชี JIA ก่อน{action}</div>
      {gate.reason === 'login' ? (
        <>
          <div className="text-caption text-text-muted">
            ครูผู้สอนกำหนดให้ผลสอบและใบประกาศของคลาสนี้ผูกกับบัญชี JIA (ชื่อจริงที่ยืนยันแล้ว) —
            ใช้บัญชี LINE หรืออีเมลเดียวกับที่ class.jiacpr.com
          </div>
          <button onClick={() => startPassportLogin()} className="btn btn-primary btn-md">
            เข้าสู่ระบบด้วยบัญชี JIA
          </button>
        </>
      ) : (
        <>
          <div className="text-caption text-text-muted">
            เข้าสู่ระบบบัญชี JIA แล้ว{name ? ` (${name})` : ''} — กดยืนยันเพื่อใช้บัญชีนี้กับผู้เรียนในเครื่องนี้
          </div>
          <button onClick={() => setShowIdentity(true)} className="btn btn-primary btn-md">
            ยืนยันตัวตนด้วยบัญชี JIA
          </button>
          <StudentIdentityModal open={showIdentity} onClose={() => setShowIdentity(false)} onConfirm={() => setShowIdentity(false)} />
        </>
      )}
    </div>
  );
}
