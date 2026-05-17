'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Player } from '@/types';
import { formatNPR, formatMonthYear } from '@/lib/utils/format';
import { PaymentBadge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Scale, TrendingDown, Users, ChevronLeft, ChevronRight, History } from 'lucide-react';

type PaymentRecord = { paid_amount: number; amount_due: number; status: string; remaining_amount: number };
type MonthHistory = { month: number; year: number; total: number; paidCount: number };

interface Props {
  players: (Pick<Player, 'id' | 'full_name' | 'status' | 'monthly_fee'>)[];
  paymentMap: Map<string, PaymentRecord>;
  photoMap: Map<string, string>;
  monthlyHistory: MonthHistory[];
  teamBalance: number;
  monthCollected: number;
  monthTarget: number;
  monthExpensesTotal: number;
  month: number;
  year: number;
}

export function TeamSummaryClient({
  players, paymentMap, photoMap, monthlyHistory, teamBalance,
  monthCollected, monthTarget, monthExpensesTotal, month, year,
}: Props) {
  const router = useRouter();
  const paidCount = players.filter(p => paymentMap.get(p.id)?.status === 'paid' || paymentMap.get(p.id)?.status === 'overpaid').length;
  const unpaidCount = players.filter(p => !paymentMap.get(p.id) || paymentMap.get(p.id)?.status === 'unpaid').length;
  const partialCount = players.filter(p => paymentMap.get(p.id)?.status === 'partial').length;
  const pct = monthTarget > 0 ? Math.round((monthCollected / monthTarget) * 100) : 0;

  const navigate = (dir: -1 | 1) => {
    let m = month + dir;
    let y = year;
    if (m < 1) { m = 12; y--; }
    if (m > 12) { m = 1; y++; }
    router.push(`/player/team?month=${m}&year=${y}`);
  };

  return (
    <div className="px-4 pt-4 space-y-5 pb-24">
      {/* Team balance hero */}
      <div className="bg-[var(--color-primary)] rounded-2xl p-5 text-white">
        <div className="flex items-center gap-2 mb-3">
          <Scale size={18} className="text-white/70" />
          <p className="text-white/70 text-sm">Team Fund Balance</p>
        </div>
        <p className="text-4xl font-bold number-display">{formatNPR(teamBalance)}</p>
        <p className="text-white/60 text-xs mt-1">Total collected minus expenses</p>
      </div>

      {/* Month navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl border border-[var(--color-border)] flex items-center justify-center text-[var(--color-muted)] hover:bg-[var(--color-surface-alt)] transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <p className="flex-1 text-center text-sm font-bold text-[var(--color-charcoal)]">{formatMonthYear(month, year)}</p>
        <button
          onClick={() => navigate(1)}
          className="w-9 h-9 rounded-xl border border-[var(--color-border)] flex items-center justify-center text-[var(--color-muted)] hover:bg-[var(--color-surface-alt)] transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Month collection */}
      <div className="bg-white rounded-2xl border border-[var(--color-border)] p-4">
        <p className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wide mb-3">Collection</p>
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

      {/* Player payment status list */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Users size={15} className="text-[var(--color-muted)]" />
          <h3 className="text-sm font-bold text-[var(--color-charcoal)]">Who Paid</h3>
        </div>
        <div className="bg-white rounded-2xl border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
          {players.map(player => {
            const payment = paymentMap.get(player.id);
            const photo = photoMap.get(player.id);
            const status = (payment?.status || 'unpaid') as 'paid' | 'unpaid' | 'partial' | 'overpaid';
            return (
              <Link key={player.id} href={`/player/team/${player.id}`} className="px-4 py-3 flex items-center gap-3 hover:bg-[var(--color-surface-alt)] transition-colors">
                <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0 overflow-hidden relative">
                  {photo ? (
                    <Image src={photo} alt={player.full_name} fill className="object-cover object-top" />
                  ) : (
                    <span className="text-xs font-bold text-[var(--color-primary)]">{player.full_name.charAt(0)}</span>
                  )}
                </div>
                <p className="flex-1 text-sm text-[var(--color-charcoal)] truncate">{player.full_name}</p>
                <div className="flex items-center gap-2">
                  <PaymentBadge status={status} size="sm" />
                  <ChevronRight size={14} className="text-[var(--color-muted)]" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Monthly history */}
      {monthlyHistory.length > 0 && (
        <section className="pb-2">
          <div className="flex items-center gap-2 mb-3">
            <History size={15} className="text-[var(--color-muted)]" />
            <h3 className="text-sm font-bold text-[var(--color-charcoal)]">Monthly History</h3>
          </div>
          <div className="bg-white rounded-2xl border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
            {monthlyHistory.map(h => (
              <button
                key={`${h.year}-${h.month}`}
                onClick={() => router.push(`/player/team?month=${h.month}&year=${h.year}`)}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[var(--color-surface-alt)] transition-colors"
              >
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-[var(--color-charcoal)]">{formatMonthYear(h.month, h.year)}</p>
                  <p className="text-xs text-[var(--color-muted)]">{h.paidCount} fully paid</p>
                </div>
                <p className="text-sm font-bold text-[var(--color-primary)] number-display">{formatNPR(h.total)}</p>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
