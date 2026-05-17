'use client';

import Image from 'next/image';
import { Player } from '@/types';
import { formatNPR, formatMonthYear } from '@/lib/utils/format';
import { PaymentBadge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Scale, TrendingDown, Users } from 'lucide-react';

type PaymentRecord = { paid_amount: number; amount_due: number; status: string; remaining_amount: number };

interface Props {
  players: (Pick<Player, 'id' | 'full_name' | 'status' | 'monthly_fee'>)[];
  paymentMap: Map<string, PaymentRecord>;
  photoMap: Map<string, string>;
  teamBalance: number;
  monthCollected: number;
  monthTarget: number;
  monthExpensesTotal: number;
  month: number;
  year: number;
}

export function TeamSummaryClient({
  players, paymentMap, photoMap, teamBalance, monthCollected, monthTarget, monthExpensesTotal, month, year
}: Props) {
  const paidCount = players.filter(p => paymentMap.get(p.id)?.status === 'paid').length;
  const unpaidCount = players.filter(p => !paymentMap.get(p.id) || paymentMap.get(p.id)?.status === 'unpaid').length;
  const partialCount = players.filter(p => paymentMap.get(p.id)?.status === 'partial').length;
  const pct = monthTarget > 0 ? Math.round((monthCollected / monthTarget) * 100) : 0;

  return (
    <div className="px-4 pt-4 space-y-5">
      {/* Team balance hero */}
      <div className="bg-[var(--color-primary)] rounded-2xl p-5 text-white">
        <div className="flex items-center gap-2 mb-3">
          <Scale size={18} className="text-white/70" />
          <p className="text-white/70 text-sm">Team Fund Balance</p>
        </div>
        <p className="text-4xl font-bold number-display">{formatNPR(teamBalance)}</p>
        <p className="text-white/60 text-xs mt-1">Total collected minus expenses</p>
      </div>

      {/* Month collection */}
      <div className="bg-white rounded-2xl border border-[var(--color-border)] p-4">
        <p className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wide mb-3">{formatMonthYear(month, year)} Collection</p>
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-2xl font-bold text-[var(--color-primary)] number-display">{formatNPR(monthCollected)}</p>
            <p className="text-xs text-[var(--color-muted)]">of {formatNPR(monthTarget)} target</p>
          </div>
          <p className="text-2xl font-bold text-[var(--color-primary)]">{pct}%</p>
        </div>
        <ProgressBar value={monthCollected} max={monthTarget} height={8} />
        <div className="flex gap-4 mt-3 text-sm">
          <div className="flex-1 text-center bg-[var(--color-paid-bg)] rounded-xl py-2">
            <p className="font-bold text-[var(--color-paid)]">{paidCount}</p>
            <p className="text-xs text-[var(--color-paid)]/80">Paid</p>
          </div>
          <div className="flex-1 text-center bg-[var(--color-partial-bg)] rounded-xl py-2">
            <p className="font-bold text-[var(--color-partial)]">{partialCount}</p>
            <p className="text-xs text-[var(--color-partial)]/80">Partial</p>
          </div>
          <div className="flex-1 text-center bg-[var(--color-unpaid-bg)] rounded-xl py-2">
            <p className="font-bold text-[var(--color-unpaid)]">{unpaidCount}</p>
            <p className="text-xs text-[var(--color-unpaid)]/80">Unpaid</p>
          </div>
        </div>
      </div>

      {/* Expenses this month */}
      <div className="bg-white rounded-2xl border border-[var(--color-border)] p-4 flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
          <TrendingDown size={20} className="text-red-500" />
        </div>
        <div>
          <p className="text-xs text-[var(--color-muted)]">This Month Expenses</p>
          <p className="text-xl font-bold text-[var(--color-unpaid)] number-display">{formatNPR(monthExpensesTotal)}</p>
        </div>
      </div>

      {/* Player list (anonymized - just show status) */}
      <section className="pb-2">
        <div className="flex items-center gap-2 mb-3">
          <Users size={15} className="text-[var(--color-muted)]" />
          <h3 className="text-sm font-bold text-[var(--color-charcoal)]">This Month Status</h3>
        </div>
        <div className="bg-white rounded-2xl border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
          {players.map(player => {
            const payment = paymentMap.get(player.id);
            const photo = photoMap.get(player.id);
            const status = (payment?.status || 'unpaid') as 'paid' | 'unpaid' | 'partial' | 'overpaid';
            return (
              <div key={player.id} className="px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0 overflow-hidden relative">
                  {photo ? (
                    <Image src={photo} alt={player.full_name} fill className="object-cover object-top" />
                  ) : (
                    <span className="text-xs font-bold text-[var(--color-primary)]">{player.full_name.charAt(0)}</span>
                  )}
                </div>
                <p className="flex-1 text-sm text-[var(--color-charcoal)] truncate">{player.full_name}</p>
                <PaymentBadge status={status} size="sm" />
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
