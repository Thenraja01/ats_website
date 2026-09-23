import { cn } from '@/lib/utils';

export default function ScoreRing({
  value = 0,
  size = 96,
  stroke = 8,
  color = 'var(--primary)',
  track = 'var(--muted)',
  children,
  className,
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value || 0));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}

export function scoreColor(value) {
  if (value >= 80) return 'var(--success)';
  if (value >= 60) return 'var(--primary)';
  if (value >= 40) return 'var(--warning)';
  return 'var(--destructive)';
}

export function scoreLabel(value) {
  if (value >= 80) return 'Excellent';
  if (value >= 70) return 'Good';
  if (value >= 60) return 'Fair';
  if (value >= 40) return 'Needs work';
  return 'Poor';
}