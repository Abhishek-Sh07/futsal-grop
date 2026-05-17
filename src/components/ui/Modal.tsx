'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/format';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Modal({ open, onClose, title, children, size = 'md', className }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative w-full bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl z-10',
          'max-h-[90vh] overflow-y-auto',
          sizes[size],
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[var(--color-border)]">
            <h2 className="text-lg font-bold text-[var(--color-charcoal)]">{title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl text-[var(--color-muted)] hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        )}
        <div className="p-5">
          {children}
        </div>
      </div>
    </div>
  );
}

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmVariant?: 'danger' | 'primary';
  loading?: boolean;
}

export function ConfirmModal({
  open, onClose, onConfirm, title, message,
  confirmLabel = 'Confirm',
  confirmVariant = 'primary',
  loading,
}: ConfirmModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-[var(--color-muted)] text-sm mb-6">{message}</p>
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 h-11 rounded-xl border-2 border-[var(--color-border)] font-semibold text-sm text-[var(--color-charcoal)] hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={cn(
            'flex-1 h-11 rounded-xl font-semibold text-sm text-white transition-colors disabled:opacity-50',
            confirmVariant === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]'
          )}
        >
          {loading ? 'Processing...' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
