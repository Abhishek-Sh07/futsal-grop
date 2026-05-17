'use client';

import { Player, Payment, Announcement, Profile } from '@/types';
import { formatNPR, formatMonthYear, formatDate } from '@/lib/utils/format';
import { PaymentBadge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { CheckCircle2, Clock, AlertTriangle, Megaphone, ChevronRight, Wallet, Scale } from 'lucide-react';
import Link from 'next/link';

interface Props {
  player: Player | null;
  profile: Profile | null;
  thisMonthPayment: Payment | null;
  payments: Payment[];
  announcements: Announcement[];
  totalPaid: number;
  totalPending: number;
  teamBalance: number;
  month: number;
  year: number;
}

export function PlayerDashboardClient({
  player, profile, thisMonthPayment, payments, announcements,
  totalPaid, totalPending, teamBalance, month, year
}: Props) {
  const firstName = (profile?.full_name || 'Player').split(' ')[0];
  const status = thisMonthPayment?.status || 'unpaid';
  const amountDue = player?.monthly_fee || 1000;
  const paidThisMonth = thisMonthPayment?.paid_amount || 0;
  const pendingThisMonth = Math.max(0, amountDue - paidThisMonth);

  return (
    <div className="px-4 pt-4 space-y-5">
      {/* Greeting */}
      <div>
        <p className="text-sm text-[var(--color-muted)]">Welcome back,</p>
        <h2 className="text-2xl font-bold text-[var(--color-charcoal)]">{firstName} 👋</h2>
      </div>

      {/* This month status card */}
      <div className={`rounded-2xl p-5 ${
        status === 'paid' ? 'bg-[var(--color-primary)]' :
        status === 'partial' ? 'bg-orange-500' :
        status === 'overpaid' ? 'bg-blue-600' :
        'bg-red-600'
      } text-white`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-white/70 text-xs uppercase tracking-wide">{formatMonthYear(month, year)}</p>
            <p className="text-white/90 text-sm mt-0.5">Monthly Contribution</p>
          </div>
          <PaymentBadge status={status} />
        </div>

        <div className="flex items-end gap-4">
          <div>
            <p className="text-3xl font-bold number-display">{formatNPR(paidThisMonth)}</p>
            <p className="text-white/70 text-xs mt-0.5">paid of {formatNPR(amountDue)}</p>
          </div>
          {status === 'paid' || status === 'overpaid' ? (
            <CheckCircle2 size={32} className="text-white/40 mb-0.5" />
          ) : status === 'partial' ? (
            <Clock size={32} className="text-white/40 mb-0.5" />
          ) : (
            <AlertTriangle size={32} className="text-white/40 mb-0.5" />
          )}
        </div>

        {status !== 'paid' && status !== 'overpaid' && (
          <div className="mt-4">
            <ProgressBar value={paidThisMonth} max={amountDue} color="rgba(255,255,255,0.5)" height={5} />
            <p className="text-white/70 text-xs mt-1.5">
              {pendingThisMonth > 0 ? `${formatNPR(pendingThisMonth)} still pending` : 'Fully paid!'}
            </p>
          </div>
        )}

        {status === 'unpaid' && (
          <div className="mt-4 pt-4 border-t border-white/15">
            <p className="text-white/80 text-sm">
              Please pay <span className="font-bold">{formatNPR(amountDue)}</span> to clear your monthly contribution.
            </p>
          </div>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border border-[var(--color-border)] p-4">
          <div className="w-9 h-9 rounded-xl bg-[var(--color-paid-bg)] flex items-center justify-center mb-2">
            <Wallet size={17} className="text-[var(--color-paid)]" />
          </div>
          <p className="text-xs text-[var(--color-muted)]">Total Paid</p>
          <p className="text-xl font-bold text-[var(--color-paid)] number-display">{formatNPR(totalPaid)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-[var(--color-border)] p-4">
          <div className="w-9 h-9 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center mb-2">
            <Scale size={17} className="text-[var(--color-primary)]" />
          </div>
          <p className="text-xs text-[var(--color-muted)]">Team Balance</p>
          <p className={`text-xl font-bold number-display ${teamBalance >= 0 ? 'text-[var(--color-primary)]' : 'text-[var(--color-unpaid)]'}`}>
            {formatNPR(teamBalance)}
          </p>
        </div>
      </div>

      {/* Recent payments */}
      {payments.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[var(--color-charcoal)]">My Recent Payments</h3>
            <Link href="/player/payments" className="text-xs text-[var(--color-primary)] font-semibold flex items-center gap-0.5">
              See all <ChevronRight size={14} />
            </Link>
          </div>
          <div className="bg-white rounded-2xl border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
            {payments.slice(0, 3).map(p => (
              <div key={p.id} className="px-4 py-3 flex items-center gap-3">
                <PaymentBadge status={p.status} size="sm" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--color-charcoal)]">
                    {new Date(p.year, p.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                  {p.paid_date && <p className="text-xs text-[var(--color-muted)]">{formatDate(p.paid_date)}</p>}
                </div>
                <p className={`text-sm font-bold number-display ${p.paid_amount > 0 ? 'text-[var(--color-paid)]' : 'text-[var(--color-unpaid)]'}`}>
                  {formatNPR(p.paid_amount)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Announcements */}
      {announcements.length > 0 && (
        <section className="pb-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[var(--color-charcoal)] flex items-center gap-1.5">
              <Megaphone size={14} className="text-[var(--color-primary)]" />
              Team Updates
            </h3>
            <Link href="/player/announcements" className="text-xs text-[var(--color-primary)] font-semibold flex items-center gap-0.5">
              See all <ChevronRight size={14} />
            </Link>
          </div>
          <div className="space-y-2">
            {announcements.slice(0, 2).map(a => (
              <div key={a.id} className="bg-white rounded-2xl border border-[var(--color-border)] p-4">
                <p className="text-sm font-bold text-[var(--color-charcoal)] mb-1">{a.title}</p>
                <p className="text-sm text-[var(--color-muted)] line-clamp-2">{a.message}</p>
                <p className="text-xs text-[var(--color-muted)]/60 mt-1.5">{formatDate(a.created_at)}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
