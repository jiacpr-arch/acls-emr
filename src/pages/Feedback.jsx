import { useState, useEffect } from 'react';

const categories = [
  { key: 'bug', icon: '🐛', label: 'แจ้งปัญหา' },
  { key: 'feature', icon: '💡', label: 'เสนอฟีเจอร์' },
  { key: 'ux', icon: '😵', label: 'ใช้งานยาก' },
  { key: 'content', icon: '📝', label: 'เนื้อหาผิด' },
  { key: 'praise', icon: '👍', label: 'ชอบมาก' },
  { key: 'other', icon: '💬', label: 'อื่นๆ' },
];

function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-1 justify-center">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          onClick={() => onChange(star)}
          className={`text-3xl transition-transform active:scale-125 ${
            star <= value ? 'text-warning' : 'text-bg-tertiary'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function Feedback() {
  const [tab, setTab] = useState('form'); // 'form' | 'history'
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
    <div className="page-container space-y-4 pb-28">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="w-14 h-14 mx-auto bg-warning rounded-2xl flex items-center justify-center shadow-md">
          <span className="text-3xl">💬</span>
        </div>
        <h1 className="text-2xl font-black text-text-primary">ส่งความคิดเห็น</h1>
        <p className="text-xs text-text-muted">ช่วยเราปรับปรุงแอป ACLS EMR</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab('form')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors ${
            tab === 'form' ? 'bg-info text-white' : 'bg-bg-tertiary text-text-secondary'
          }`}
        >
          ส่ง Feedback
        </button>
        <button
          onClick={() => setTab('history')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors ${
            tab === 'history' ? 'bg-info text-white' : 'bg-bg-tertiary text-text-secondary'
          }`}
        >
          ประวัติ ({history.length})
        </button>
      </div>

      {tab === 'form' ? (
        submitted ? (
          <div className="bg-bg-secondary rounded-xl p-8 text-center space-y-3 animate-slide-up">
            <div className="text-5xl">🙏</div>
            <div className="text-lg font-bold text-text-primary">ขอบคุณครับ!</div>
            <div className="text-sm text-text-muted">ความคิดเห็นของคุณถูกบันทึกแล้ว</div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Star Rating */}
            <div className="bg-bg-secondary rounded-xl p-4 space-y-2">
              <div className="text-sm font-bold text-text-primary text-center">
                ให้คะแนนแอป
              </div>
              <StarRating value={rating} onChange={setRating} />
              <div className="text-xs text-text-muted text-center">
                {rating === 0 && 'แตะดาวเพื่อให้คะแนน'}
                {rating === 1 && 'แย่มาก'}
                {rating === 2 && 'ต้องปรับปรุง'}
                {rating === 3 && 'พอใช้'}
                {rating === 4 && 'ดี'}
                {rating === 5 && 'ดีมาก!'}
              </div>
            </div>

            {/* Category */}
            <div className="bg-bg-secondary rounded-xl p-4 space-y-2">
              <div className="text-sm font-bold text-text-primary">หมวดหมู่</div>
              <div className="grid grid-cols-3 gap-2">
                {categories.map(c => (
                  <button
                    key={c.key}
                    onClick={() => setCategory(c.key)}
                    className={`py-3 rounded-xl text-center transition-colors ${
                      category === c.key
                        ? 'bg-info text-white'
                        : 'bg-bg-primary border border-bg-tertiary text-text-secondary'
                    }`}
                  >
                    <div className="text-xl">{c.icon}</div>
                    <div className="text-[10px] font-bold mt-1">{c.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div className="bg-bg-secondary rounded-xl p-4 space-y-2">
              <div className="text-sm font-bold text-text-primary">รายละเอียด</div>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="บอกเราว่าคุณคิดอย่างไร..."
                className="w-full px-3 py-3 rounded-lg bg-bg-primary border border-bg-tertiary text-sm text-text-primary focus:outline-none focus:border-info"
                rows={4}
              />
            </div>

            {/* Submit */}
            <button
              onClick={submit}
              disabled={!category || !message.trim()}
              className="w-full py-3.5 rounded-xl bg-info text-white font-bold text-sm disabled:opacity-40 transition-opacity"
            >
              ส่งความคิดเห็น
            </button>
          </div>
        )
      ) : (
        /* History Tab */
        <div className="space-y-2">
          {history.length === 0 ? (
            <div className="text-center text-text-muted text-sm py-8">
              ยังไม่มีประวัติ feedback
            </div>
          ) : (
            <>
              {history.map(item => {
                const cat = categories.find(c => c.key === item.category);
                return (
                  <div key={item.id || item.timestamp} className="bg-bg-secondary rounded-xl p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{cat?.icon || '💬'}</span>
                        <span className="text-xs font-bold text-text-primary">
                          {cat?.label || item.type || 'อื่นๆ'}
                        </span>
                      </div>
                      <div className="text-[10px] text-text-muted">
                        {new Date(item.timestamp).toLocaleDateString('th-TH', {
                          day: 'numeric',
                          month: 'short',
                          year: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                    {item.rating > 0 && (
                      <div className="text-warning text-sm">
                        {'★'.repeat(item.rating)}
                        {'☆'.repeat(5 - item.rating)}
                      </div>
                    )}
                    <div className="text-xs text-text-secondary">{item.message}</div>
                  </div>
                );
              })}
              <button
                onClick={clearHistory}
                className="w-full text-xs text-text-muted underline text-center py-2"
              >
                ล้างประวัติทั้งหมด
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
