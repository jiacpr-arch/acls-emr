import { useState, useEffect } from 'react';

// ===== STEP CARD =====
export function StepCard({ phase, phaseColor, icon, title, subtitle, instructions, children }) {
  return (
    <div className="text-center space-y-4 animate-slide-up px-2">
      <div className={`section-header ${phaseColor}`}>{phase}</div>
      <div className="text-5xl">{icon}</div>
      <div>
        <h1 className="text-[1.65rem] font-black text-text-primary leading-tight">{title}</h1>
        {subtitle && <p className="text-text-secondary text-[0.85rem] mt-1.5">{subtitle}</p>}
      </div>
      {instructions && (
        <div className="instruction-list text-left">
          {instructions.map((inst, i) => (
            <div key={i} className="instruction-item">{inst}</div>
          ))}
        </div>
      )}
      <div className="space-y-4 pt-2">{children}</div>
    </div>
  );
}

// ===== BIG BUTTON =====
export function BigButton({ color, onClick, children, size = 'normal', disabled = false }) {
  const pad = size === 'huge' ? 'py-7 text-xl' : 'py-4 text-[1.05rem]';
  const btnClass = color.includes('bg-danger') ? 'btn-danger'
    : color.includes('bg-info') ? 'btn-info'
    : color.includes('bg-success') ? 'btn-success'
    : color.includes('bg-warning') ? 'btn-warning'
    : color.includes('bg-purple') ? 'btn-purple'
    : color.includes('bg-shock') ? 'btn-shock'
    : color.includes('bg-cyan') ? 'btn-info'
    : 'btn-ghost';
  const extra = color.includes('animate-pulse') ? 'animate-pulse' : '';
  return (
    <button onClick={onClick} disabled={disabled}
      className={`w-full ${pad} btn-action ${btnClass} ${extra} disabled:opacity-40 disabled:cursor-not-allowed`}>
      {children}
    </button>
  );
}

// ===== TRAINING HINT =====
export function TrainingHint({ show, children }) {
  if (!show) return null;
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-left text-xs text-blue-700 space-y-1 w-full">
      <div className="font-bold text-[10px] uppercase tracking-wider text-blue-500">Training Tip</div>
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
      <div className="text-xs">Max pulse check time</div>
    </div>
  );
}
