import { useState, useEffect } from 'react';

// Render `icon` flexibly: string → emoji span, React element → as-is, component → render
function renderIcon(icon) {
  if (icon == null) return null;
  if (typeof icon === 'string') return <span className="text-3xl leading-none">{icon}</span>;
  if (typeof icon === 'function') {
    const I = icon;
    return <I size={36} strokeWidth={2} />;
  }
  return icon;
}

// ===== STEP CARD =====
export function StepCard({ phase, phaseColor, icon, title, subtitle, instructions, children }) {
  return (
    <div className="text-center space-y-4 animate-slide-up w-full max-w-md mx-auto">
      {phase && <div className={`section-header ${phaseColor}`}>{phase}</div>}
      {icon && (
        <div className="w-16 h-16 mx-auto inline-flex items-center justify-center bg-bg-tertiary text-text-secondary"
          style={{ borderRadius: 'var(--radius-2xl)' }}>
          {renderIcon(icon)}
        </div>
      )}
      <div>
        <h1 className="text-headline text-text-primary leading-tight">{title}</h1>
        {subtitle && <p className="text-text-secondary text-caption mt-1.5 leading-relaxed">{subtitle}</p>}
      </div>
      {instructions && (
        <div className="instruction-list text-left">
          {instructions.map((inst, i) => (
            <div key={i} className="instruction-item">{inst}</div>
          ))}
        </div>
      )}
      <div className="space-y-3 pt-1">{children}</div>
    </div>
  );
}

// ===== BIG BUTTON =====
export function BigButton({ color, onClick, children, size = 'normal', disabled = false }) {
  const sizeClass = size === 'huge' ? 'btn-xl' : 'btn-lg';
  const c = color || '';
  const btnClass = c.includes('bg-danger') || c.includes('danger') ? 'btn-danger'
    : c.includes('bg-info') || c.includes('info') ? 'btn-primary'
    : c.includes('bg-success') || c.includes('success') ? 'btn-success'
    : c.includes('bg-warning') || c.includes('warning') ? 'btn-warning'
    : c.includes('bg-purple') || c.includes('purple') ? 'btn-purple'
    : c.includes('bg-shock') || c.includes('shock') ? 'btn-shock'
    : 'btn-ghost';
  const extra = c.includes('animate-pulse') ? 'animate-pulse' : '';
  return (
    <button onClick={onClick} disabled={disabled}
      className={`btn btn-block ${sizeClass} ${btnClass} ${extra} ${disabled ? 'btn-disabled' : ''}`}>
      {children}
    </button>
  );
}

// ===== TRAINING HINT =====
export function TrainingHint({ show, children }) {
  if (!show) return null;
  return (
    <div
      className="text-left text-caption text-info space-y-1 w-full"
      style={{
        background: 'rgba(37, 99, 235, 0.06)',
        border: '1px solid rgba(37, 99, 235, 0.25)',
        borderLeft: '4px solid var(--color-info)',
        padding: '12px 14px',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <div className="text-overline" style={{ color: 'var(--color-info)' }}>Training Tip</div>
      {children}
    </div>
  );
}

// ===== COUNTDOWN HINT =====
export function CountdownHint({ seconds }) {
  const [count, setCount] = useState(seconds);
  useEffect(() => {
    if (count <= 0) return;
    const t = setTimeout(() => setCount(count - 1), 1000);
    return () => clearTimeout(t);
  }, [count]);

  return (
    <div className={`text-center ${count <= 3 ? 'text-danger' : 'text-warning'}`}>
      <div className="text-numeric text-5xl">{count}s</div>
      <div className="text-caption">Max pulse check time</div>
    </div>
  );
}
