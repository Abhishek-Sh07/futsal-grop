'use client';

import { Player, PlayerStats, PlayerContribution, PlayerProfile, TeamSettings } from '@/types';
import { formatDate } from '@/lib/utils/format';
import { calculateRating, calculatePaymentReliability } from '@/lib/utils/rating';
import { DynamicPlayerCard } from '@/components/ui/DynamicPlayerCard';
import { RatingBreakdownCard, PaymentReliabilityCard } from '@/components/ui/PlayerCard';
import { Phone, Calendar, MapPin, Footprints } from 'lucide-react';

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
  player: Player;
  stats: PlayerStats | null;
  contribution: PlayerContribution | null;
  playerProfile: PlayerProfile | null;
  teamSettings: TeamSettings | null;
  payments: Array<{ status: string }>;
}

export function PlayerPublicProfileClient({ player, stats, contribution, playerProfile, teamSettings, payments }: Props) {
  const s = stats ?? DEFAULT_STATS;
  const c = contribution ?? DEFAULT_CONTRIB;
  const rating = calculateRating(s, c);
  const reliability = calculatePaymentReliability(payments);

  return (
    <div className="px-4 pt-4 pb-24 space-y-4">
      {/* Player Card */}
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

      {/* Basic info */}
      <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5">
        <h3 className="text-sm font-bold text-[var(--color-charcoal)] mb-3">Info</h3>
        <div className="space-y-3">
          {player.phone && (
            <a href={`tel:${player.phone}`} className="flex items-center gap-3 text-sm text-[var(--color-charcoal)] hover:text-[var(--color-primary)] transition-colors">
              <Phone size={15} className="text-[var(--color-muted)] shrink-0" />
              <span>{player.phone}</span>
            </a>
          )}
          {player.joined_date && (
            <div className="flex items-center gap-3 text-sm text-[var(--color-charcoal)]">
              <Calendar size={15} className="text-[var(--color-muted)] shrink-0" />
              <span>Joined {formatDate(player.joined_date)}</span>
            </div>
          )}
          {playerProfile?.preferred_position && (
            <div className="flex items-center gap-3 text-sm text-[var(--color-charcoal)]">
              <MapPin size={15} className="text-[var(--color-muted)] shrink-0" />
              <span>{playerProfile.preferred_position}{playerProfile.secondary_position ? ` / ${playerProfile.secondary_position}` : ''}</span>
            </div>
          )}
          {playerProfile?.strong_foot && (
            <div className="flex items-center gap-3 text-sm text-[var(--color-charcoal)]">
              <Footprints size={15} className="text-[var(--color-muted)] shrink-0" />
              <span>{playerProfile.strong_foot} foot</span>
            </div>
          )}
        </div>
      </div>

      {/* Rating breakdown */}
      <RatingBreakdownCard rating={rating} />

      {/* Payment reliability */}
      <PaymentReliabilityCard
        percentage={reliability.percentage}
        label={reliability.label}
        paidMonths={reliability.paidMonths}
        totalMonths={reliability.totalMonths}
      />
    </div>
  );
}
