'use client';

import { useRouter } from 'next/navigation';
import { Profile, Player } from '@/types';
import { formatNPR, formatDate } from '@/lib/utils/format';
import { toast } from '@/components/ui/Toast';
import { createClient } from '@/lib/supabase/client';
import { User, Phone, Mail, Calendar, Wallet, LogOut } from 'lucide-react';

interface Props { profile: Profile | null; player: Player | null; }

export function PlayerProfileClient({ profile, player }: Props) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="px-4 pt-4 space-y-4">
      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center">
            <span className="text-2xl font-bold text-[var(--color-primary)]">
              {(profile?.full_name || 'P').charAt(0)}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--color-charcoal)]">{profile?.full_name}</h2>
            <span className="inline-block text-xs font-medium text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2.5 py-0.5 rounded-full mt-1">
              Player
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {profile?.email && (
            <div className="flex items-center gap-3 text-sm text-[var(--color-charcoal)]">
              <Mail size={15} className="text-[var(--color-muted)] shrink-0" />
              <span>{profile.email}</span>
            </div>
          )}
          {(profile?.phone || player?.phone) && (
            <div className="flex items-center gap-3 text-sm text-[var(--color-charcoal)]">
              <Phone size={15} className="text-[var(--color-muted)] shrink-0" />
              <span>{profile?.phone || player?.phone}</span>
            </div>
          )}
          {player?.joined_date && (
            <div className="flex items-center gap-3 text-sm text-[var(--color-charcoal)]">
              <Calendar size={15} className="text-[var(--color-muted)] shrink-0" />
              <span>Joined {formatDate(player.joined_date)}</span>
            </div>
          )}
          {player?.monthly_fee && (
            <div className="flex items-center gap-3 text-sm text-[var(--color-charcoal)]">
              <Wallet size={15} className="text-[var(--color-muted)] shrink-0" />
              <span>Monthly fee: {formatNPR(player.monthly_fee)}</span>
            </div>
          )}
        </div>
      </div>

      {/* App info */}
      <div className="bg-white rounded-2xl border border-[var(--color-border)] p-4">
        <h3 className="text-sm font-bold text-[var(--color-charcoal)] mb-3">About</h3>
        <div className="space-y-2 text-sm text-[var(--color-muted)]">
          <div className="flex justify-between"><span>App</span><span className="font-medium text-[var(--color-charcoal)]">Futsal Hisab</span></div>
          <div className="flex justify-between"><span>Version</span><span className="font-medium text-[var(--color-charcoal)]">1.0.0</span></div>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="w-full h-12 rounded-2xl border border-red-200 text-red-600 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-red-50 transition-colors"
      >
        <LogOut size={16} /> Sign Out
      </button>
    </div>
  );
}
