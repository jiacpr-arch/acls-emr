import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function RequireAdmin({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="page-container py-12 text-center text-caption text-text-muted">
        กำลังตรวจสอบสิทธิ์…
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
