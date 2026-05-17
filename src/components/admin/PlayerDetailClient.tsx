'use client';

import { useState } from 'react';
import { Player, Payment, PlayerStats, PlayerContribution, PlayerProfile, TeamSettings, MONTHS } from '@/types';
import { formatNPR, formatDate, cn } from '@/lib/utils/format';
import { calculateRating, calculatePaymentReliability } from '@/lib/utils/rating';
import { PaymentBadge } from '@/components/ui/Badge';
import { Card, StatCard } from '@/components/ui/Card';
import { RatingBreakdownCard, PaymentReliabilityCard } from '@/components/ui/PlayerCard';
import { DynamicPlayerCard } from '@/components/ui/DynamicPlayerCard';
import { PlayerStatsEditor } from '@/components/admin/PlayerStatsEditor';
import { PlayerProfileEditor } from '@/components/admin/PlayerProfileEditor';
import { SetPlayerPasswordButton } from '@/components/admin/SetPlayerPasswordButton';
import Image from 'next/image';
import { Phone, Mail, Calendar, Wallet, TrendingUp, AlertCircle } from 'lucide-react';

interface Props {
  player: Player;
  payments: Payment[];
  totalPaid: number;
  totalPending: number;
  stats: PlayerStats | null;
  contribution: PlayerContribution | null;
  playerProfile: PlayerProfile | null;
  teamSettings: TeamSettings | null;
}

type Tab = 'overview' | 'rating' | 'card';

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

export function PlayerDetailClient({ player, payments, totalPaid, totalPending, stats, contribution, playerProfile, teamSettings }: Props) {
  const [tab, setTab] = useState<Tab>('overview');
  const [currentProfile, setCurrentProfile] = useState<PlayerProfile | null>(playerProfile);

  const s = stats ?? DEFAULT_STATS;
  const c = contribution ?? DEFAULT_CONTRIB;
  const rating = calculateRating(s, c);
  const reliability = calculatePaymentReliability(payments);

  const cardStats = {
    matches: s.matches_played,
    goals: s.goals,
    assists: s.assists,
    attendance: s.attendance_percentage,
    isGoalkeeper: s.is_goalkeeper,
    cleanSheets: s.clean_sheets,
    saves: s.saves,
  };

  return (
    <div className="px-4 pt-4 pb-24 space-y-4">
      {/* Tab bar */}
      <div className="flex gap-1 bg-[var(--color-surface-alt)] p-1 rounded-xl">
        {(['overview', 'rating', 'card'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cn(
              'flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all',
              tab === t ? 'bg-white text-[var(--color-primary)] shadow-sm' : 'text-[var(--color-muted)]'
            )}>
            {t === 'rating' ? 'Rating' : t === 'card' ? 'Player Card' : 'Overview'}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          {/* Profile card */}
          <Card>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center overflow-hidden relative shrink-0">
                {currentProfile?.photo_url ? (
                  <Image src={currentProfile.photo_url} alt={player.full_name} fill className="object-cover object-top" />
                ) : (
                  <span className="text-2xl font-bold text-[var(--color-primary)]">{player.full_name.charAt(0)}</span>
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--color-charcoal)]">{player.full_name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${player.status === 'active' ? 'bg-[var(--color-paid-bg)] text-[var(--color-paid)]' : 'bg-gray-100 text-gray-500'}`}>
                    {player.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                  {!rating.isNewPlayer && (
                    <span className="text-xs font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2.5 py-0.5 rounded-full">
                      {rating.finalRating} · {rating.ratingLabel}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-2.5">
              {player.phone && <div className="flex items-center gap-2 text-sm text-[var(--color-muted)]"><Phone size={14} /><span>{player.phone}</span></div>}
              {player.email && <div className="flex items-center gap-2 text-sm text-[var(--color-muted)]"><Mail size={14} /><span>{player.email}</span></div>}
              <div className="flex items-center gap-2 text-sm text-[var(--color-muted)]"><Calendar size={14} /><span>Joined {formatDate(player.joined_date)}</span></div>
              <div className="flex items-center gap-2 text-sm text-[var(--color-muted)]"><Wallet size={14} /><span>Monthly fee: {formatNPR(player.monthly_fee)}</span></div>
              {player.notes && <p className="text-xs text-[var(--color-muted)] bg-[var(--color-surface-alt)] rounded-xl p-2.5 mt-2">{player.notes}</p>}
            </div>
            <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
              <SetPlayerPasswordButton playerId={player.id} playerName={player.full_name} />
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Total Paid" value={formatNPR(totalPaid)} icon={<TrendingUp size={18} />} accentColor="var(--color-paid)" />
            <StatCard label="Total Pending" value={formatNPR(totalPending)} icon={<AlertCircle size={18} />} accentColor={totalPending > 0 ? 'var(--color-unpaid)' : 'var(--color-muted)'} />
          </div>

          <PaymentReliabilityCard
            percentage={reliability.percentage}
            label={reliability.label}
            paidMonths={reliability.paidMonths}
            totalMonths={reliability.totalMonths}
          />

          {/* Payment history */}
          <section>
            <h3 className="text-sm font-bold text-[var(--color-charcoal)] mb-3">Payment History</h3>
            {payments.length === 0 ? (
              <Card><p className="text-sm text-center text-[var(--color-muted)] py-6">No payment records yet</p></Card>
            ) : (
              <div className="bg-white rounded-2xl border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
                {payments.map(p => (
                  <div key={p.id} className="px-4 py-3.5 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-[var(--color-charcoal)]">{MONTHS[p.month - 1]} {p.year}</p>
                        <PaymentBadge status={p.status} size="sm" />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[var(--color-muted)]">
                        <span>Due: {formatNPR(p.amount_due)}</span>
                        <span>Paid: {formatNPR(p.paid_amount)}</span>
                        {p.remaining_amount > 0 && <span className="text-[var(--color-partial)]">Pending: {formatNPR(p.remaining_amount)}</span>}
                      </div>
                      {p.paid_date && <p className="text-xs text-[var(--color-muted)]/70 mt-0.5">Paid on {formatDate(p.paid_date)}{p.payment_method && ` via ${p.payment_method.replace('_', ' ')}`}</p>}
                    </div>
                    <div className="text-right shrink-0">
                      {p.status === 'paid' || p.status === 'overpaid' ? (
                        <span className="text-sm font-bold text-[var(--color-paid)] number-display">+{formatNPR(p.paid_amount)}</span>
                      ) : p.paid_amount > 0 ? (
                        <span className="text-sm font-bold text-[var(--color-partial)] number-display">{formatNPR(p.paid_amount)}</span>
                      ) : (
                        <span className="text-sm font-bold text-[var(--color-unpaid)] number-display">{formatNPR(p.amount_due)} due</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {tab === 'rating' && (
        <>
          <RatingBreakdownCard rating={rating} />
          <div className="bg-white rounded-2xl border border-[var(--color-border)] p-4">
            <p className="text-sm font-bold text-[var(--color-charcoal)] mb-4">Edit Stats</p>
            <PlayerStatsEditor playerId={player.id} stats={s} contribution={c} />
          </div>
        </>
      )}

      {tab === 'card' && (
        <>
          <DynamicPlayerCard
            player={player}
            profile={currentProfile}
            team={teamSettings}
            rating={rating}
            stats={cardStats}
            variant="full"
            showActions
          />
          <div className="bg-white rounded-2xl border border-[var(--color-border)] p-4">
            <p className="text-sm font-bold text-[var(--color-charcoal)] mb-4">Edit Card Profile</p>
            <PlayerProfileEditor
              playerId={player.id}
              profile={currentProfile}
              onUpdate={setCurrentProfile}
            />
          </div>
        </>
      )}
    </div>
  );
}
