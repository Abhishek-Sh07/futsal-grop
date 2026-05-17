'use client';

import { PaymentStatus } from '@/types';
import { cn } from '@/lib/utils/format';

interface BadgeProps {
  status: PaymentStatus;
  size?: 'sm' | 'md';
  className?: string;
}

const STATUS_CONFIG: Record<PaymentStatus, { label: string; className: string }> = {
  paid:     { label: 'Paid',      className: 'bg-[var(--color-paid-bg)] text-[var(--color-paid)] border-[var(--color-paid)]/20' },
  unpaid:   { label: 'Unpaid',    className: 'bg-[var(--color-unpaid-bg)] text-[var(--color-unpaid)] border-[var(--color-unpaid)]/20' },
  partial:  { label: 'Partial',   className: 'bg-[var(--color-partial-bg)] text-[var(--color-partial)] border-[var(--color-partial)]/20' },
  overpaid: { label: 'Overpaid',  className: 'bg-[var(--color-overpaid-bg)] text-[var(--color-overpaid)] border-[var(--color-overpaid)]/20' },
};

export function PaymentBadge({ status, size = 'md', className }: BadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold border rounded-full',
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}

interface StatusDotProps {
  status: PaymentStatus;
}

export function StatusDot({ status }: StatusDotProps) {
  const colors: Record<PaymentStatus, string> = {
    paid: 'bg-[var(--color-paid)]',
    unpaid: 'bg-[var(--color-unpaid)]',
    partial: 'bg-[var(--color-partial)]',
    overpaid: 'bg-[var(--color-overpaid)]',
  };
  return (
    <span className={cn('inline-block w-2 h-2 rounded-full', colors[status])} />
  );
}

interface TagProps {
  children: React.ReactNode;
  color?: 'green' | 'red' | 'orange' | 'blue' | 'gray';
  className?: string;
}

export function Tag({ children, color = 'gray', className }: TagProps) {
  const colors = {
    green:  'bg-green-100 text-green-800',
    red:    'bg-red-100 text-red-800',
    orange: 'bg-orange-100 text-orange-800',
    blue:   'bg-blue-100 text-blue-800',
    gray:   'bg-gray-100 text-gray-700',
  };
  return (
    <span className={cn('inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full', colors[color], className)}>
      {children}
    </span>
  );
}
