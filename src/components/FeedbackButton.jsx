import { useState } from 'react';

// Floating feedback button — always accessible
// Stores feedback locally, syncs when online
export function FeedbackButton() {
  const [show, setShow] = useState(false);

  return (
    <>
      <button onClick={() => setShow(true)}
        className="fixed bottom-20 right-3 z-30 w-10 h-10 rounded-full bg-info text-white shadow-lg flex items-center justify-center text-sm"
        style={{ minHeight: '40px', minWidth: '40px' }}>
        💬
      </button>
      {show && <FeedbackPanel onClose={() => setShow(false)} />}
    </>
  );
}

function FeedbackPanel({ onClose }) {
  const [type, setType] = useState(null);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const types = [
    { key: 'bug', label: '🐛 Bug', desc: 'Something broken' },
    { key: 'feature', label: '💡 Feature', desc: 'Want something new' },
    { key: 'ux', label: '😵 UX', desc: 'Hard to use / confusing' },
    { key: 'content', label: '📝 Content', desc: 'Wrong / missing info' },
  ];

  const submit = () => {
    const feedback = {
      type, message, timestamp: new Date().toISOString(),
      page: window.location.pathname,
      userAgent: navigator.userAgent,
    };
    // Store locally
    const existing = JSON.parse(localStorage.getItem('acls_feedback') || '[]');
    existing.push(feedback);
    localStorage.setItem('acls_feedback', JSON.stringify(existing));
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
        <div className="glass-card !p-5 m-6 text-center space-y-3 animate-slide-up" onClick={e => e.stopPropagation()}>
          <div className="text-4xl">🙏</div>
          <div className="text-sm font-bold text-text-primary">Thank you!</div>
          <div className="text-xs text-text-muted">Your feedback has been saved</div>
          <button onClick={onClose} className="btn-action btn-info py-2 px-6 text-xs">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30" onClick={onClose}>
      <div className="w-full max-w-lg bg-white rounded-t-2xl p-4 space-y-3 animate-slide-up"
        onClick={e => e.stopPropagation()}
        style={{ boxShadow: '0 -4px 24px rgba(0,0,0,0.15)' }}>
        <div className="text-sm font-bold text-text-primary text-center">💬 Send Feedback</div>

        {/* Type selection */}
        <div className="grid grid-cols-4 gap-1.5">
          {types.map(t => (
            <button key={t.key} onClick={() => setType(t.key)}
              className={`py-2.5 rounded-xl text-center text-[10px] font-bold transition-colors ${
                type === t.key ? 'bg-info text-white' : 'bg-bg-primary border border-bg-tertiary text-text-secondary'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Message */}
        <textarea value={message} onChange={e => setMessage(e.target.value)}
          placeholder="Tell us what happened..."
          className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-bg-tertiary text-sm text-text-primary focus:outline-none focus:border-info"
          rows={3} />

        <button onClick={submit} disabled={!type || !message.trim()}
          className="w-full btn-action btn-info py-3 text-sm font-bold disabled:opacity-40">
          Send Feedback
        </button>
        <button onClick={onClose} className="w-full text-text-muted text-xs underline text-center">Cancel</button>
      </div>
    </div>
  );
}
