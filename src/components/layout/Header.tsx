'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils/format';

interface HeaderProps {
  title: string;
  subtitle?: string;
  left?: ReactNode;
  right?: ReactNode;
  className?: string;
  sticky?: boolean;
}

export function Header({ title, subtitle, left, right, className, sticky = true }: HeaderProps) {
  return (
    <header
      className={cn(
        'bg-white border-b border-[var(--color-border)] z-30 safe-top',
        sticky && 'sticky top-0',
        className
      )}
    >
      <div className="flex items-center gap-3 px-4 h-14">
        {left && <div className="shrink-0">{left}</div>}
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold text-[var(--color-charcoal)] truncate leading-tight">{title}</h1>
          {subtitle && <p className="text-xs text-[var(--color-muted)] truncate">{subtitle}</p>}
        </div>
        {right && <div className="shrink-0 flex items-center gap-1">{right}</div>}
      </div>
    </header>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-5">
      <div>
        <h2 className="text-lg font-bold text-[var(--color-charcoal)]">{title}</h2>
        {description && <p className="text-sm text-[var(--color-muted)] mt-0.5">{description}</p>}
      </div>
      {action}
    </div>
  );
}
