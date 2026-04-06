// Reusable SVG circular timer ring
// Based on CCFGauge.jsx pattern but generalized

export default function CircularTimer({
  value,        // current value (e.g. seconds remaining)
  max,          // maximum value (e.g. 120 for 2-min cycle)
  size = 140,
  strokeWidth = 8,
  color = 'stroke-info',
  bgColor = 'stroke-bg-tertiary',
  children,     // content inside the ring
  alert = false, // pulse animation when true
}) {
  const radius = (size / 2) - strokeWidth - 2;
  const circumference = 2 * Math.PI * radius;
  const progress = max > 0 ? Math.min(value / max, 1) : 0;
  const offset = circumference * (1 - progress);

  return (
    <div className={`relative inline-flex items-center justify-center ${alert ? 'animate-pulse' : ''}`}
      style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" strokeWidth={strokeWidth}
          className={bgColor}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`${color} transition-all duration-300`}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}
