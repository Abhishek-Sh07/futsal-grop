'use client';

import { cn } from '@/lib/utils/format';
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export function Input({ label, error, hint, leftIcon, rightElement, className, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-semibold text-[var(--color-charcoal)] mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          className={cn(
            'w-full h-11 rounded-xl border border-[var(--color-border)] bg-white text-sm text-[var(--color-charcoal)]',
            'px-3.5 transition-all duration-150',
            'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]',
            'placeholder:text-gray-400',
            'disabled:bg-[var(--color-surface-alt)] disabled:opacity-60',
            leftIcon ? 'pl-10' : undefined,
            rightElement ? 'pr-10' : undefined,
            error && 'border-red-400 focus:ring-red-400/30 focus:border-red-400',
            className
          )}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
            {rightElement}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-[var(--color-muted)]">{hint}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: Array<{ value: string; label: string }>;
}

export function Select({ label, error, hint, options, className, id, ...props }: SelectProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-semibold text-[var(--color-charcoal)] mb-1.5">
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={cn(
          'w-full h-11 rounded-xl border border-[var(--color-border)] bg-white text-sm text-[var(--color-charcoal)]',
          'px-3.5 transition-all duration-150 appearance-none cursor-pointer',
          'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]',
          error && 'border-red-400',
          className
        )}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-[var(--color-muted)]">{hint}</p>}
    </div>
  );
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function TextArea({ label, error, hint, className, id, ...props }: TextAreaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-semibold text-[var(--color-charcoal)] mb-1.5">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={cn(
          'w-full rounded-xl border border-[var(--color-border)] bg-white text-sm text-[var(--color-charcoal)]',
          'px-3.5 py-2.5 resize-none transition-all duration-150',
          'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]',
          'placeholder:text-gray-400',
          error && 'border-red-400',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-[var(--color-muted)]">{hint}</p>}
    </div>
  );
}
