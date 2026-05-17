'use client';

import Link from 'next/link';
import { formatNPR, formatMonthYear, formatDate } from '@/lib/utils/format';
import { DashboardStats, Payment, Expense, Announcement } from '@/types';
import { StatCard } from '@/components/ui/Card';
import { PaymentBadge } from '@/components/ui/Badge';
import { ProgressBar, CircularProgress } from '@/components/ui/ProgressBar';
import {
  Users, Wallet, TrendingDown, Scale, ChevronRight,
  AlertTriangle, CheckCircle2, Clock, Megaphone, Plus
} from 'lucide-react';

interface Props {
  stats: DashboardStats;
  month: number;
  year: number;
  recentPayments: Payment[];
  recentExpenses: Expense[];
  unpaidPlayers: Payment[];
  announcements: Announcement[];
  adminName: string;
}

export function AdminDashboardClient({
  stats, month, year, recentPayments, recentExpenses, unpaidPlayers, announcements, adminName
}: Props) {
  const collectionPct = stats.monthlyTarget > 0
    ? Math.round((stats.totalCollected / stats.monthlyTarget) * 100)
    : 0;

  return (
    <div className="px-4 pt-4 space-y-5">
      {/* Welcome bar */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-[var(--color-muted)]">Welcome back,</p>
          <h2 className="text-lg font-bold text-[var(--color-charcoal)]">{adminName} 👋</h2>
        </div>
        <Link
          href="/admin/payments"
          className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-[var(--color-primary)] text-white text-xs font-semibold hover:bg-[var(--color-primary-dark)] transition-colors"
        >
          <Plus size={14} />
          Add Payment
        </Link>
      </div>

      {/* Collection progress card */}
      <div className="bg-[var(--color-primary)] rounded-2xl p-5 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-white/70 text-xs font-medium uppercase tracking-wide mb-1">
              {formatMonthYear(month, year)} Collection
            </p>
            <p className="text-3xl font-bold number-display">{formatNPR(stats.totalCollected)}</p>
            <p className="text-white/60 text-sm mt-1">of {formatNPR(stats.monthlyTarget)} target</p>
          </div>
          <CircularProgress
            value={stats.totalCollected}
            max={stats.monthlyTarget}
            size={80}
            strokeWidth={8}
            label={`${collectionPct}%`}
            sublabel="done"
          />
        </div>

        <div className="mt-4">
          <ProgressBar
            value={stats.totalCollected}
            max={stats.monthlyTarget}
            color="var(--color-accent)"
            height={6}
          />
        </div>

        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/15">
          <div className="flex-1 text-center">
            <p className="text-white font-bold text-lg number-display">{stats.paidCount}</p>
            <p className="text-white/60 text-xs">Paid</p>
          </div>
          <div className="w-px h-8 bg-white/15" />
          <div className="flex-1 text-center">
            <p className="text-white font-bold text-lg number-display">{stats.partialCount}</p>
            <p className="text-white/60 text-xs">Partial</p>
          </div>
          <div className="w-px h-8 bg-white/15" />
          <div className="flex-1 text-center">
            <p className="text-amber-300 font-bold text-lg number-display">{stats.unpaidCount}</p>
            <p className="text-white/60 text-xs">Unpaid</p>
          </div>
        </div>
      </div>

      {/* Quick stat grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Active Players"
          value={String(stats.activePlayers)}
          sub={`${stats.totalPlayers} total`}
          icon={<Users size={18} />}
        />
        <StatCard
          label="Pending Dues"
          value={formatNPR(stats.pendingAmount)}
          sub={`${stats.unpaidCount + stats.partialCount} players`}
          icon={<AlertTriangle size={18} />}
          accentColor="var(--color-partial)"
        />
        <StatCard
          label="This Month Expenses"
          value={formatNPR(stats.totalExpenses)}
          icon={<TrendingDown size={18} />}
          accentColor="var(--color-unpaid)"
        />
        <StatCard
          label="Current Balance"
          value={formatNPR(stats.currentBalance)}
          icon={<Scale size={18} />}
          accentColor={stats.currentBalance >= 0 ? 'var(--color-paid)' : 'var(--color-unpaid)'}
        />
      </div>

      {/* Pending players */}
      {unpaidPlayers.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[var(--color-charcoal)] flex items-center gap-1.5">
              <AlertTriangle size={15} className="text-[var(--color-partial)]" />
              Pending Players ({unpaidPlayers.length})
            </h3>
            <Link href="/admin/payments" className="text-xs text-[var(--color-primary)] font-semibold flex items-center gap-0.5">
              View all <ChevronRight size={14} />
            </Link>
          </div>
          <div className="space-y-2">
            {unpaidPlayers.slice(0, 4).map(p => (
              <div key={p.id} className="bg-white rounded-2xl border border-[var(--color-border)] p-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[var(--color-partial-bg)] flex items-center justify-center shrink-0">
                  <AlertTriangle size={16} className="text-[var(--color-partial)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--color-charcoal)] truncate">
                    {(p as Payment & { player?: { full_name: string } }).player?.full_name || 'Unknown'}
                  </p>
                  <p className="text-xs text-[var(--color-muted)]">
                    {formatNPR(p.remaining_amount ?? (p.amount_due - p.paid_amount))} pending
                  </p>
                </div>
                <PaymentBadge status={p.status} size="sm" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent payments */}
      {recentPayments.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[var(--color-charcoal)] flex items-center gap-1.5">
              <CheckCircle2 size={15} className="text-[var(--color-paid)]" />
              Recent Payments
            </h3>
            <Link href="/admin/payments" className="text-xs text-[var(--color-primary)] font-semibold flex items-center gap-0.5">
              View all <ChevronRight size={14} />
            </Link>
          </div>
          <div className="bg-white rounded-2xl border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
            {recentPayments.map(p => {
              const player = (p as Payment & { player?: { full_name: string } }).player;
              return (
                <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-paid-bg)] flex items-center justify-center shrink-0">
                    <CheckCircle2 size={15} className="text-[var(--color-paid)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-charcoal)] truncate">{player?.full_name}</p>
                    <p className="text-xs text-[var(--color-muted)]">{p.paid_date ? formatDate(p.paid_date) : ''}</p>
                  </div>
                  <span className="text-sm font-bold text-[var(--color-paid)] number-display">+{formatNPR(p.paid_amount)}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Recent expenses */}
      {recentExpenses.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[var(--color-charcoal)] flex items-center gap-1.5">
              <TrendingDown size={15} className="text-[var(--color-unpaid)]" />
              Recent Expenses
            </h3>
            <Link href="/admin/expenses" className="text-xs text-[var(--color-primary)] font-semibold flex items-center gap-0.5">
              View all <ChevronRight size={14} />
            </Link>
          </div>
          <div className="bg-white rounded-2xl border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
            {recentExpenses.map(e => (
              <div key={e.id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                  <TrendingDown size={15} className="text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-charcoal)] truncate">{e.title}</p>
                  <p className="text-xs text-[var(--color-muted)]">{formatDate(e.expense_date)}</p>
                </div>
                <span className="text-sm font-bold text-[var(--color-unpaid)] number-display">-{formatNPR(e.amount)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Announcements preview */}
      {announcements.length > 0 && (
        <section className="pb-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[var(--color-charcoal)] flex items-center gap-1.5">
              <Megaphone size={15} className="text-[var(--color-primary)]" />
              Announcements
            </h3>
            <Link href="/admin/announcements" className="text-xs text-[var(--color-primary)] font-semibold flex items-center gap-0.5">
              Manage <ChevronRight size={14} />
            </Link>
          </div>
          <div className="space-y-2">
            {announcements.slice(0, 2).map(a => (
              <div key={a.id} className="bg-white rounded-2xl border border-[var(--color-border)] p-4">
                <p className="text-sm font-semibold text-[var(--color-charcoal)] mb-0.5">{a.title}</p>
                <p className="text-xs text-[var(--color-muted)] line-clamp-2">{a.message}</p>
                <p className="text-xs text-[var(--color-muted)]/60 mt-1.5">{formatDate(a.created_at)}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
