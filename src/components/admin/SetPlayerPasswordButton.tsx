'use client';

import { useState } from 'react';
import { KeyRound, Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { setPlayerPassword } from '@/app/actions/playerAuth';
import { toast } from '@/components/ui/Toast';

interface Props {
  playerId: string;
  playerName: string;
}

export function SetPlayerPasswordButton({ playerId, playerName }: Props) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!password) return;
    setLoading(true);
    const result = await setPlayerPassword(playerId, password);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Login set — they can use ${result.email}`);
      setDone(true);
      setOpen(false);
      setPassword('');
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full h-10 rounded-xl border border-[var(--color-border)] text-sm font-semibold text-[var(--color-charcoal)] flex items-center justify-center gap-2 hover:bg-[var(--color-surface-alt)] transition-colors"
      >
        {done ? <CheckCircle2 size={15} className="text-green-500" /> : <KeyRound size={15} />}
        {done ? 'Login Set' : 'Set Login Password'}
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--color-border)] p-3 space-y-2">
      <p className="text-xs font-semibold text-[var(--color-charcoal)]">Set password for {playerName}</p>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Enter password (min 6 chars)"
          className="w-full h-10 rounded-lg border border-[var(--color-border)] px-3 pr-10 text-sm bg-[var(--color-surface-alt)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          autoFocus
        />
        <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
      <div className="flex gap-2">
        <button onClick={() => { setOpen(false); setPassword(''); }} className="flex-1 h-9 rounded-lg border border-[var(--color-border)] text-xs font-semibold text-[var(--color-muted)]">
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading || password.length < 6}
          className="flex-1 h-9 rounded-lg bg-[var(--color-primary)] text-white text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : <KeyRound size={13} />}
          {loading ? 'Setting…' : 'Confirm'}
        </button>
      </div>
    </div>
  );
}
