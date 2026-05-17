'use client';

import { cn } from '@/lib/utils/format';
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading,
  leftIcon,
  rightIcon,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-150 select-none focus:outline-none focus:ring-2 focus:ring-offset-1 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:   'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] focus:ring-[var(--color-primary)]/40',
    secondary: 'bg-[var(--color-accent)] text-[var(--color-charcoal)] hover:bg-[var(--color-accent-dark)] focus:ring-[var(--color-accent)]/40',
    ghost:     'bg-transparent text-[var(--color-primary)] hover:bg-[var(--color-primary)]/8 focus:ring-[var(--color-primary)]/20',
    danger:    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/40',
    outline:   'bg-transparent border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 focus:ring-[var(--color-primary)]/20',
  };

  const sizes = {
    sm: 'text-sm px-3 py-1.5 h-8',
    md: 'text-sm px-4 py-2.5 h-10',
    lg: 'text-base px-6 py-3 h-12',
  };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(base, variants[variant], sizes[size], className)}
    >
      {loading ? (
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
}

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'primary' | 'danger';
}

export function IconButton({ children, label, size = 'md', variant = 'ghost', className, ...props }: IconButtonProps) {
  const sizes = { sm: 'w-7 h-7', md: 'w-9 h-9', lg: 'w-11 h-11' };
  const variants = {
    ghost:   'text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/8',
    primary: 'text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]',
    danger:  'text-red-600 hover:bg-red-50',
  };
  return (
    <button
      aria-label={label}
      className={cn(
        'inline-flex items-center justify-center rounded-xl transition-all duration-150 focus:outline-none active:scale-95',
        sizes[size],
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
