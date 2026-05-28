import { useEffect, useState } from 'react';
import {
  isPushSupported,
  getPermissionState,
  subscribePush,
  unsubscribePush,
  getCurrentSubscription,
} from '../services/pushService';
import { Bell, Check, X } from './ui/Icon';

export default function PushToggle() {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState('default');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const sup = isPushSupported();
    setSupported(sup);
    if (!sup) return;
    setPermission(getPermissionState());
    getCurrentSubscription().then(sub => setSubscribed(!!sub));
  }, []);

  if (!supported) return null;

  const handleEnable = async () => {
    setLoading(true);
    setError(null);
    try {
      await subscribePush();
      setSubscribed(true);
      setPermission('granted');
    } catch (e) {
      setError(String(e?.message || e));
      setPermission(getPermissionState());
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setLoading(true);
    setError(null);
    try {
      await unsubscribePush();
      setSubscribed(false);
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  };

  const blocked = permission === 'denied';

  return (
    <div className="dash-card flex items-center gap-3">
      <div
        className="w-10 h-10 inline-flex items-center justify-center shrink-0"
        style={{
          background: subscribed ? 'rgba(5, 150, 105, 0.12)' : 'rgba(37, 99, 235, 0.12)',
          color: subscribed ? '#059669' : '#2563EB',
          borderRadius: 'var(--radius)',
        }}
      >
        <Bell size={18} strokeWidth={2.2} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-body-strong text-text-primary">
          {subscribed ? 'เปิดแจ้งเตือนข่าวแล้ว' : 'รับแจ้งเตือนเมื่อมีข่าวใหม่'}
        </div>
        <div className="text-caption text-text-muted mt-0.5">
          {blocked
            ? 'เบราว์เซอร์บล็อกการแจ้งเตือนไว้ — เปิดที่ Site settings ของเบราว์เซอร์'
            : subscribed
            ? 'จะได้แจ้งเตือนทุกครั้งที่มีข่าวใหม่เกี่ยวกับ ACLS/BLS/CPR'
            : 'แตะปุ่มแล้วอนุญาต notification เพื่อรับข่าวสำคัญ'}
        </div>
        {error && <div className="text-caption text-danger mt-1">{error}</div>}
      </div>
      {!blocked && (
        subscribed ? (
          <button onClick={handleDisable} disabled={loading} className="btn btn-ghost btn-sm">
            <X size={14} strokeWidth={2.2} /> ปิด
          </button>
        ) : (
          <button onClick={handleEnable} disabled={loading} className="btn btn-info btn-sm">
            <Check size={14} strokeWidth={2.2} /> {loading ? '…' : 'เปิด'}
          </button>
        )
      )}
    </div>
  );
}
