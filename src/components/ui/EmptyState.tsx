'use client';

import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-alt)] flex items-center justify-center mb-4 text-[var(--color-muted)]">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-[var(--color-charcoal)] mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-[var(--color-muted)] max-w-xs mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}
