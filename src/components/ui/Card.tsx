'use client';

import { cn } from '@/lib/utils/format';
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ children, className, onClick, interactive, padding = 'md' }: CardProps) {
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-5',
  };
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-card)]',
        paddings[padding],
        interactive && 'cursor-pointer transition-all duration-150 active:scale-[0.98] hover:shadow-[var(--shadow-card-hover)]',
        className
      )}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  accentColor?: string;
  className?: string;
}

export function StatCard({ label, value, sub, icon, accentColor = 'var(--color-primary)', className }: StatCardProps) {
  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide mb-1">{label}</p>
          <p
            className="text-2xl font-bold number-display leading-tight"
            style={{ color: accentColor }}
          >
            {value}
          </p>
          {sub && <p className="text-xs text-[var(--color-muted)] mt-1">{sub}</p>}
        </div>
        {icon && (
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 opacity-90"
            style={{ background: `${accentColor}18` }}
          >
            <span style={{ color: accentColor }}>{icon}</span>
          </div>
        )}
      </div>
    </Card>
  );
}
