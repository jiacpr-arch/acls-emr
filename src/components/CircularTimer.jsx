// Reusable SVG circular timer ring — CodeBlue style
// Clean, bold, medical-grade design

export default function CircularTimer({
  value,        // current value (e.g. seconds remaining)
  max,          // maximum value (e.g. 120 for 2-min cycle)
  size = 150,
  strokeWidth = 10,
  color = 'stroke-info',
  bgColor = 'stroke-bg-tertiary',
  children,     // content inside the ring
  alert = false, // pulse animation when true
  label,        // label below the ring
  sublabel,     // secondary label
}) {
  const radius = (size / 2) - strokeWidth - 2;
  const circumference = 2 * Math.PI * radius;
  const progress = max > 0 ? Math.min(value / max, 1) : 0;
  const offset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center">
      <div className={`relative inline-flex items-center justify-center ${alert ? 'animate-pulse' : ''}`}
        style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90 timer-ring">
          {/* Background circle */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" strokeWidth={strokeWidth}
            className={bgColor}
            opacity="0.4"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={color}
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {children}
        </div>
      </div>
      {label && <div className="mt-1.5 text-[10px] text-text-muted font-bold uppercase tracking-wider">{label}</div>}
      {sublabel && <div className="text-xs font-bold text-text-primary">{sublabel}</div>}
    </div>
  );
}
