import { AlertTriangle } from 'lucide-react';

// Shared error card with an optional retry button (pattern from the admin
// pages' error banner + the exam pages' load-error card).
export default function ErrorCard({ title = 'เกิดข้อผิดพลาด', detail, onRetry }) {
  return (
    <div className="dash-card text-center !p-6 space-y-2">
      <AlertTriangle size={28} className="mx-auto text-danger" />
      <div className="text-body text-danger">{title}</div>
      {detail && <div className="text-caption text-text-muted">{detail}</div>}
      {onRetry && (
        <button onClick={onRetry} className="btn btn-primary btn-md mt-2">ลองใหม่</button>
      )}
    </div>
  );
}
