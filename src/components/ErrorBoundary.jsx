import { Component } from 'react';
import ErrorCard from './ui/ErrorCard';

// Catches render errors anywhere below it so a single broken page can't
// white-screen the whole app — it may be open mid-training or mid-code.
// Reload is a full page reload: persisted stores + IndexedDB survive it.
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled render error:', error, info?.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-bg-primary text-text-primary">
        <div className="w-full max-w-sm space-y-3">
          <ErrorCard
            title="เกิดข้อผิดพลาดในการแสดงผล"
            detail="ข้อมูลที่บันทึกไว้ยังอยู่ครบ — กดโหลดหน้าใหม่เพื่อใช้งานต่อ"
            onRetry={() => window.location.reload()}
          />
          <button
            onClick={() => { window.location.href = '/'; }}
            className="btn btn-ghost btn-md w-full"
          >
            กลับหน้าแรก
          </button>
        </div>
      </div>
    );
  }
}
