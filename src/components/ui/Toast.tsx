'use client';

import { Toaster, toast as hotToast } from 'react-hot-toast';

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#fff',
          color: '#1e1e1e',
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '500',
          padding: '12px 16px',
          border: '1px solid #e5e7e0',
        },
        success: {
          iconTheme: { primary: '#1a5c3a', secondary: '#fff' },
        },
        error: {
          iconTheme: { primary: '#dc2626', secondary: '#fff' },
        },
      }}
    />
  );
}

export const toast = {
  success: (msg: string) => hotToast.success(msg),
  error: (msg: string) => hotToast.error(msg),
  loading: (msg: string) => hotToast.loading(msg),
  dismiss: hotToast.dismiss,
};
