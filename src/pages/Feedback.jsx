import { useState, useEffect } from 'react';
import {
  MessageSquare, AlertCircle, Lightbulb, AlertTriangle, Edit, Heart,
  Send, Star, Trash,
} from '../components/ui/Icon';

const categories = [
  { key: 'bug', Icon: AlertCircle, label: 'แจ้งปัญหา' },
  { key: 'feature', Icon: Lightbulb, label: 'เสนอฟีเจอร์' },
  { key: 'ux', Icon: AlertTriangle, label: 'ใช้งานยาก' },
  { key: 'content', Icon: Edit, label: 'เนื้อหาผิด' },
  { key: 'praise', Icon: Heart, label: 'ชอบมาก' },
  { key: 'other', Icon: MessageSquare, label: 'อื่นๆ' },
];

function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-2 justify-center">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          onClick={() => onChange(star)}
          className="transition-transform active:scale-125 p-1"
          aria-label={`Rate ${star}`}
        >
          <Star size={32} strokeWidth={1.6}
            className={star <= value ? 'text-warning' : 'text-bg-tertiary'}
            fill={star <= value ? 'currentColor' : 'none'} />
        </button>
      ))}
    </div>
  );
}

export default function Feedback() {
  const [tab, setTab] = useState('form');
  const [category, setCategory] = useState(null);
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('acls_feedback') || '[]');
    setHistory(data.reverse());
  }, [submitted]);

  const submit = () => {
    const feedback = {
      id: Date.now(),
      category,
      rating,
      message,
      timestamp: new Date().toISOString(),
      page: 'feedback',
      userAgent: navigator.userAgent,
    };
    const existing = JSON.parse(localStorage.getItem('acls_feedback') || '[]');
    existing.push(feedback);
    localStorage.setItem('acls_feedback', JSON.stringify(existing));
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setCategory(null);
      setRating(0);
      setMessage('');
    }, 2000);
  };

  const clearHistory = () => {
    localStorage.setItem('acls_feedback', '[]');
    setHistory([]);
  };

  return (
    <div className="page-container space-y-5">
      {/* Header */}
      <div className="text-center space-y-2">
        <div
          className="w-16 h-16 mx-auto inline-flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, var(--color-warning) 0%, var(--color-warning-dark) 100%)',
            borderRadius: 'var(--radius-2xl)',
            boxShadow: '0 8px 20px rgba(217, 119, 6, 0.28)',
          }}
        >
          <MessageSquare size={28} strokeWidth={2.2} className="text-white" />
        </div>
        <h1 className="text-title text-text-primary">ส่งความคิดเห็น</h1>
        <p className="text-caption text-text-muted">ช่วยเราปรับปรุงแอป ACLS EMR</p>
      </div>

      {/* Tabs */}
      <div className="tab-group">
        <button onClick={() => setTab('form')} className={`tab-item ${tab === 'form' ? 'active' : ''}`}>
          ส่ง Feedback
        </button>
        <button onClick={() => setTab('history')} className={`tab-item ${tab === 'history' ? 'active' : ''}`}>
          ประวัติ ({history.length})
        </button>
      </div>

      {tab === 'form' ? (
        submitted ? (
          <div className="dash-card p-8 text-center space-y-3 animate-slide-up">
            <div className="w-14 h-14 mx-auto inline-flex items-center justify-center bg-success/12 text-success"
              style={{ borderRadius: 99 }}>
              <Heart size={28} strokeWidth={2.2} />
            </div>
            <div className="text-headline text-text-primary">ขอบคุณครับ!</div>
            <div className="text-caption text-text-muted">ความคิดเห็นของคุณถูกบันทึกแล้ว</div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Star Rating */}
            <div className="dash-card space-y-2">
              <div className="text-body-strong text-text-primary text-center">ให้คะแนนแอป</div>
              <StarRating value={rating} onChange={setRating} />
              <div className="text-caption text-text-muted text-center">
                {rating === 0 && 'แตะดาวเพื่อให้คะแนน'}
                {rating === 1 && 'แย่มาก'}
                {rating === 2 && 'ต้องปรับปรุง'}
                {rating === 3 && 'พอใช้'}
                {rating === 4 && 'ดี'}
                {rating === 5 && 'ดีมาก!'}
              </div>
            </div>

            {/* Category */}
            <div className="dash-card space-y-2">
              <div className="text-body-strong text-text-primary">หมวดหมู่</div>
              <div className="grid grid-cols-3 gap-2">
                {categories.map(c => {
                  const CIcon = c.Icon;
                  const active = category === c.key;
                  return (
                    <button
                      key={c.key}
                      onClick={() => setCategory(c.key)}
                      className={`flex flex-col items-center gap-1.5 py-3 transition-colors border ${
                        active
                          ? 'bg-info/10 text-info border-info/40'
                          : 'bg-bg-primary border-border text-text-secondary hover:bg-bg-tertiary'
                      }`}
                      style={{ borderRadius: 'var(--radius-md)' }}
                    >
                      <CIcon size={20} strokeWidth={2.2} />
                      <div className="text-[11px] font-bold">{c.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Message */}
            <div className="dash-card space-y-2">
              <div className="text-body-strong text-text-primary">รายละเอียด</div>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="บอกเราว่าคุณคิดอย่างไร…"
                className="w-full px-3 py-3 text-caption text-text-primary"
                rows={4}
              />
            </div>

            {/* Submit */}
            <button
              onClick={submit}
              disabled={!category || !message.trim()}
              className="btn btn-primary btn-lg btn-block disabled:opacity-40"
            >
              <Send size={16} strokeWidth={2.2} /> ส่งความคิดเห็น
            </button>
          </div>
        )
      ) : (
        <div className="space-y-2">
          {history.length === 0 ? (
            <div className="text-center text-text-muted text-caption py-10">ยังไม่มีประวัติ feedback</div>
          ) : (
            <>
              {history.map(item => {
                const cat = categories.find(c => c.key === item.category);
                const CIcon = cat?.Icon || MessageSquare;
                return (
                  <div key={item.id || item.timestamp} className="dash-card !p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 inline-flex items-center justify-center bg-bg-tertiary text-text-secondary"
                          style={{ borderRadius: 'var(--radius-sm)' }}>
                          <CIcon size={14} strokeWidth={2} />
                        </div>
                        <span className="text-caption font-bold text-text-primary">
                          {cat?.label || item.type || 'อื่นๆ'}
                        </span>
                      </div>
                      <div className="text-[10px] text-text-muted font-mono">
                        {new Date(item.timestamp).toLocaleDateString('th-TH', {
                          day: 'numeric', month: 'short', year: '2-digit',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </div>
                    </div>
                    {item.rating > 0 && (
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} size={12} strokeWidth={1.6}
                            className={s <= item.rating ? 'text-warning' : 'text-bg-tertiary'}
                            fill={s <= item.rating ? 'currentColor' : 'none'} />
                        ))}
                      </div>
                    )}
                    <div className="text-caption text-text-secondary">{item.message}</div>
                  </div>
                );
              })}
              <button
                onClick={clearHistory}
                className="btn btn-ghost btn-sm btn-block mt-2"
              >
                <Trash size={14} strokeWidth={2} /> ล้างประวัติทั้งหมด
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
