'use client';

import { cn } from '@/lib/utils/format';

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  color?: string;
  height?: number;
  showLabel?: boolean;
  animate?: boolean;
}

export function ProgressBar({
  value,
  max = 100,
  className,
  color = 'var(--color-primary)',
  height = 8,
  showLabel,
  animate = true,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.round((value / max) * 100));

  return (
    <div className={cn('w-full', className)}>
      <div
        className="w-full rounded-full bg-[var(--color-border)] overflow-hidden"
        style={{ height }}
      >
        <div
          className={cn('h-full rounded-full transition-all duration-1000 ease-out', animate && 'progress-animate')}
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-[var(--color-muted)] mt-1 text-right">{pct}%</p>
      )}
    </div>
  );
}

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
}

export function CircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 10,
  label,
  sublabel,
}: CircularProgressProps) {
  const pct = Math.min(100, (value / max) * 100);
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ - dash}`}
          style={{ transition: 'stroke-dasharray 1s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {label && <span className="text-xl font-bold text-[var(--color-primary)] number-display leading-none">{label}</span>}
        {sublabel && <span className="text-xs text-[var(--color-muted)] mt-0.5">{sublabel}</span>}
      </div>
    </div>
  );
}
