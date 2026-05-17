'use client';

import { RatingBreakdown } from '@/types';
import { getRatingGradient } from '@/lib/utils/rating';
import { cn } from '@/lib/utils/format';

interface PlayerCardProps {
  name: string;
  rating: RatingBreakdown;
  stats: {
    matches: number;
    goals: number;
    assists: number;
    attendance: number;
    isGoalkeeper: boolean;
    cleanSheets: number;
    saves: number;
  };
  position?: string;
  className?: string;
}

export function PlayerCard({ name, rating, stats, position, className }: PlayerCardProps) {
  const gradient = getRatingGradient(rating.finalRating, rating.isNewPlayer);
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className={cn('w-full max-w-[220px] mx-auto select-none', className)}>
      <div className={cn(
        'relative rounded-3xl bg-gradient-to-br p-4 shadow-2xl text-white overflow-hidden',
        gradient
      )}>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4 w-32 h-32 rounded-full border-4 border-white" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full border-4 border-white" />
        </div>

        <div className="relative">
          {/* Top row: rating + label + position */}
          <div className="flex items-start justify-between mb-1">
            <div>
              <div className={cn(
                'font-black leading-none',
                rating.isNewPlayer ? 'text-2xl' : 'text-5xl'
              )}>
                {rating.isNewPlayer ? 'NEW' : rating.finalRating}
              </div>
              <div className="text-xs font-bold opacity-80 mt-0.5 uppercase tracking-wide">
                {rating.ratingLabel}
              </div>
            </div>
            {position && (
              <div className="bg-white/20 rounded-lg px-2 py-1 text-xs font-bold backdrop-blur-sm">
                {position}
              </div>
            )}
          </div>

          {/* Avatar */}
          <div className="flex justify-center my-3">
            <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center backdrop-blur-sm shadow-lg">
              <span className="text-3xl font-black">{initial}</span>
            </div>
          </div>

          {/* Name */}
          <div className="text-center mb-3">
            <p className="font-bold text-sm leading-tight truncate">{name.split(' ')[0]}</p>
            {name.split(' ').length > 1 && (
              <p className="font-bold text-sm leading-tight truncate opacity-80">
                {name.split(' ').slice(1).join(' ')}
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-white/30 mb-3" />

          {/* Stats grid */}
          <div className="grid grid-cols-4 gap-1 text-center">
            <StatCell label="MP" value={stats.matches} />
            {stats.isGoalkeeper ? (
              <>
                <StatCell label="CS" value={stats.cleanSheets} />
                <StatCell label="SV" value={stats.saves} />
              </>
            ) : (
              <>
                <StatCell label="G" value={stats.goals} />
                <StatCell label="A" value={stats.assists} />
              </>
            )}
            <StatCell label="ATT" value={`${Math.round(stats.attendance)}%`} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCell({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="text-sm font-black">{value}</div>
      <div className="text-[9px] font-semibold opacity-70 uppercase tracking-wider">{label}</div>
    </div>
  );
}

interface RatingBreakdownCardProps {
  rating: RatingBreakdown;
  className?: string;
}

export function RatingBreakdownCard({ rating, className }: RatingBreakdownCardProps) {
  if (rating.isNewPlayer) {
    return (
      <div className={cn('bg-white rounded-2xl border border-[var(--color-border)] p-4', className)}>
        <p className="text-sm font-bold text-[var(--color-charcoal)] mb-1">Rating Breakdown</p>
        <p className="text-xs text-[var(--color-muted)]">
          No match data yet. Admin can add stats after the first game.
        </p>
      </div>
    );
  }

  const bars: Array<{ label: string; score: number; max: number; color: string }> = [
    { label: 'Performance', score: rating.performanceScore, max: 50, color: 'bg-[var(--color-primary)]' },
    { label: 'Attendance', score: rating.attendanceScore, max: 20, color: 'bg-blue-500' },
    { label: 'Contribution', score: rating.contributionScore, max: 20, color: 'bg-purple-500' },
    { label: 'Discipline', score: rating.disciplineScore, max: 10, color: 'bg-amber-500' },
  ];

  return (
    <div className={cn('bg-white rounded-2xl border border-[var(--color-border)] p-4 space-y-3', className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-[var(--color-charcoal)]">Rating Breakdown</p>
        <span className="text-lg font-black text-[var(--color-primary)]">{rating.finalRating}</span>
      </div>

      {bars.map(bar => (
        <div key={bar.label}>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-medium text-[var(--color-charcoal)]">{bar.label}</span>
            <span className="font-bold text-[var(--color-muted)]">{bar.score} / {bar.max}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all', bar.color)}
              style={{ width: `${(bar.score / bar.max) * 100}%` }}
            />
          </div>
        </div>
      ))}

      <p className="text-[10px] text-[var(--color-muted)] pt-1 border-t border-[var(--color-border)]">
        Rating = Performance + Attendance + Contribution + Discipline
      </p>
    </div>
  );
}

interface PaymentReliabilityCardProps {
  percentage: number;
  label: string;
  paidMonths: number;
  totalMonths: number;
  className?: string;
}

export function PaymentReliabilityCard({ percentage, label, paidMonths, totalMonths, className }: PaymentReliabilityCardProps) {
  const color =
    percentage >= 90 ? 'text-[var(--color-paid)]' :
    percentage >= 75 ? 'text-blue-600' :
    percentage >= 50 ? 'text-amber-600' :
    'text-[var(--color-unpaid)]';

  const bg =
    percentage >= 90 ? 'bg-[var(--color-paid-bg)]' :
    percentage >= 75 ? 'bg-blue-50' :
    percentage >= 50 ? 'bg-amber-50' :
    'bg-[var(--color-unpaid-bg)]';

  if (totalMonths === 0) {
    return (
      <div className={cn('bg-white rounded-2xl border border-[var(--color-border)] p-4', className)}>
        <p className="text-sm font-bold text-[var(--color-charcoal)] mb-1">Payment Reliability</p>
        <p className="text-xs text-[var(--color-muted)]">No payment records yet.</p>
      </div>
    );
  }

  return (
    <div className={cn('rounded-2xl border border-[var(--color-border)] p-4', bg, className)}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-bold text-[var(--color-charcoal)]">Payment Reliability</p>
        <span className={cn('text-xl font-black', color)}>{percentage}%</span>
      </div>
      <div className="h-2.5 bg-white/60 rounded-full overflow-hidden mb-2">
        <div
          className={cn('h-full rounded-full', percentage >= 90 ? 'bg-[var(--color-paid)]' : percentage >= 75 ? 'bg-blue-500' : percentage >= 50 ? 'bg-amber-500' : 'bg-[var(--color-unpaid)]')}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between text-xs">
        <span className={cn('font-bold', color)}>{label}</span>
        <span className="text-[var(--color-muted)]">{paidMonths} of {totalMonths} months paid</span>
      </div>
    </div>
  );
}
