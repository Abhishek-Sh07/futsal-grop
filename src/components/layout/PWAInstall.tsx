'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstall() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed) setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setShowBanner(false);
    setInstallPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-install-dismissed', '1');
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 bg-[var(--color-charcoal)] text-white rounded-2xl p-4 shadow-2xl flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)] flex items-center justify-center shrink-0">
        <Download size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">Install Futsal Hisab</p>
        <p className="text-xs text-white/60">Add to Home Screen for quick access</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleInstall}
          className="h-8 px-3 rounded-lg bg-[var(--color-accent)] text-[var(--color-charcoal)] text-xs font-bold"
        >
          Install
        </button>
        <button onClick={handleDismiss} className="text-white/50 hover:text-white p-1">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
