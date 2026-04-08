import { useState, useEffect } from 'react';

// ===== STEP CARD =====
export function StepCard({ phase, phaseColor, icon, title, subtitle, instructions, children }) {
  return (
    <div className="text-center space-y-4 animate-slide-up w-full max-w-md mx-auto">
      <div className={`section-header ${phaseColor}`}>{phase}</div>
      <div className="text-4xl">{icon}</div>
      <div>
        <h1 className="text-xl font-black text-text-primary leading-tight">{title}</h1>
        {subtitle && <p className="text-text-secondary text-sm mt-1.5 leading-relaxed">{subtitle}</p>}
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
  const btnClass = color.includes('bg-danger') || color.includes('danger') ? 'btn-danger'
    : color.includes('bg-info') || color.includes('info') ? 'btn-primary'
    : color.includes('bg-success') || color.includes('success') ? 'btn-success'
    : color.includes('bg-warning') || color.includes('warning') ? 'btn-warning'
    : color.includes('bg-purple') || color.includes('purple') ? 'btn-purple'
    : color.includes('bg-shock') || color.includes('shock') ? 'btn-shock'
    : 'btn-ghost';
  const extra = color.includes('animate-pulse') ? 'animate-pulse' : '';
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
    <div className="glass-card !p-3 text-left text-sm text-blue-700 dark:text-blue-300 space-y-1 w-full border-l-4 border-blue-400">
      <div className="font-bold text-xs uppercase tracking-wider text-blue-500">Training Tip</div>
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
      <div className="text-5xl font-mono font-black">{count}s</div>
      <div className="text-sm">Max pulse check time</div>
    </div>
  );
}
