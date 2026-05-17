'use client';

import { useRouter } from 'next/navigation';
import { Profile, Player, PlayerStats, PlayerContribution, PlayerProfile, TeamSettings } from '@/types';
import { formatNPR, formatDate } from '@/lib/utils/format';
import { calculateRating, calculatePaymentReliability } from '@/lib/utils/rating';
import { RatingBreakdownCard, PaymentReliabilityCard } from '@/components/ui/PlayerCard';
import { DynamicPlayerCard } from '@/components/ui/DynamicPlayerCard';
import { toast } from '@/components/ui/Toast';
import { createClient } from '@/lib/supabase/client';
import { Phone, Mail, Calendar, Wallet, LogOut } from 'lucide-react';

const DEFAULT_STATS: PlayerStats = {
  id: '', player_id: '', matches_played: 0, goals: 0, assists: 0, wins: 0,
  losses: 0, draws: 0, mvp_count: 0, yellow_cards: 0, red_cards: 0,
  attendance_percentage: 0, clean_sheets: 0, saves: 0, goals_conceded: 0,
  late_cancellations: 0, no_shows: 0, is_goalkeeper: false, updated_at: '',
};
const DEFAULT_CONTRIB: PlayerContribution = {
  id: '', player_id: '', availability_response_points: 0, assigned_position_points: 0,
  versatility_points: 0, substitute_points: 0, organization_points: 0,
  captain_points: 0, updated_by: null, updated_at: '',
};

interface Props {
  profile: Profile | null;
  player: Player | null;
  stats: PlayerStats | null;
  contribution: PlayerContribution | null;
  payments: Array<{ status: string }>;
  playerProfile: PlayerProfile | null;
  teamSettings: TeamSettings | null;
}

export function PlayerProfileClient({ profile, player, stats, contribution, payments, playerProfile, teamSettings }: Props) {
  const router = useRouter();

  const s = stats ?? DEFAULT_STATS;
  const c = contribution ?? DEFAULT_CONTRIB;
  const rating = calculateRating(s, c);
  const reliability = calculatePaymentReliability(payments);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="px-4 pt-4 pb-24 space-y-4">
      {/* Dynamic player card */}
      {player && (
        <DynamicPlayerCard
          player={player}
          profile={playerProfile}
          team={teamSettings}
          rating={rating}
          stats={{
            matches: s.matches_played,
            goals: s.goals,
            assists: s.assists,
            attendance: s.attendance_percentage,
            isGoalkeeper: s.is_goalkeeper,
            cleanSheets: s.clean_sheets,
            saves: s.saves,
          }}
          variant="full"
          showActions
        />
      )}

      {/* Rating breakdown */}
      <RatingBreakdownCard rating={rating} />

      {/* Payment reliability */}
      <PaymentReliabilityCard
        percentage={reliability.percentage}
        label={reliability.label}
        paidMonths={reliability.paidMonths}
        totalMonths={reliability.totalMonths}
      />

      {/* Profile info */}
      <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center">
            <span className="text-xl font-bold text-[var(--color-primary)]">
              {(profile?.full_name || 'P').charAt(0)}
            </span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--color-charcoal)]">{profile?.full_name}</h2>
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
