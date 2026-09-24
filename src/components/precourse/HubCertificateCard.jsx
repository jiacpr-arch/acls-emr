import { useEffect, useState } from 'react';
import { Award } from 'lucide-react';
import { COURSE_MODE } from '../../config/courseMode';
import { fetchHubCertificates } from '../../services/passport';

// The JIA Hub's central online certificate (learning_hub.person_certificates), issued once the
// server-graded post-test this app sends to the Hub is accepted there. Shown alongside this app's
// own certificate, which is unchanged (owner decision). Only for the learner whose JIA account is
// logged in on this device (sub must match the active student's hubSub) — never someone else's.
const HUB_COURSE_FOR = { acls: 'als', bls: 'bls', airway: 'airway', defib: 'defib', iv: 'iv' };

export default function HubCertificateCard({ sub }) {
  const [cert, setCert] = useState(null);

  useEffect(() => {
    if (!sub) return undefined;
    let cancelled = false;
    fetchHubCertificates().then((data) => {
      if (cancelled || !data.loggedIn || data.sub !== sub) return;
      setCert(data.certificates.find((c) => c.courseId === HUB_COURSE_FOR[COURSE_MODE] && c.status === 'issued' && c.verifyUrl) || null);
    });
    return () => { cancelled = true; };
  }, [sub]);

  if (!sub || !cert) return null;
  const expires = cert.expiresAt ? new Date(cert.expiresAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
  return (
    <a href={cert.verifyUrl} target="_blank" rel="noreferrer" data-testid="hub-certificate"
      className="dash-card !p-3 flex items-start gap-3 border border-success/40 hover:border-success transition-colors">
      <Award size={20} strokeWidth={2.2} className="text-success shrink-0 mt-0.5" />
      <span className="text-left">
        <span className="block text-body font-bold">ใบประกาศออนไลน์กลาง JIA</span>
        <span className="block text-caption text-text-muted">
          เลขที่ <span className="font-mono">{cert.number}</span>{expires ? ` · หมดอายุ ${expires}` : ''}
        </span>
        <span className="block text-caption text-info font-bold">ตรวจสอบ / เปิดใบที่ class.jiacpr.com ↗</span>
      </span>
    </a>
  );
}
