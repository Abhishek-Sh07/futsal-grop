'use client';

import { Player, Payment, MONTHS } from '@/types';
import { formatNPR, formatDate } from '@/lib/utils/format';
import { PaymentBadge } from '@/components/ui/Badge';
import { Card, StatCard } from '@/components/ui/Card';
import { Phone, Mail, Calendar, Wallet, TrendingUp, AlertCircle } from 'lucide-react';

interface Props {
  player: Player;
  payments: Payment[];
  totalPaid: number;
  totalPending: number;
}

export function PlayerDetailClient({ player, payments, totalPaid, totalPending }: Props) {
  return (
    <div className="px-4 pt-4 space-y-5">
      {/* Profile card */}
      <Card>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center">
            <span className="text-2xl font-bold text-[var(--color-primary)]">
              {player.full_name.charAt(0)}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--color-charcoal)]">{player.full_name}</h2>
            <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full mt-1 ${player.status === 'active' ? 'bg-[var(--color-paid-bg)] text-[var(--color-paid)]' : 'bg-gray-100 text-gray-500'}`}>
              {player.status === 'active' ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        <div className="space-y-2.5">
          {player.phone && (
            <div className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
              <Phone size={14} />
              <span>{player.phone}</span>
            </div>
          )}
          {player.email && (
            <div className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
              <Mail size={14} />
              <span>{player.email}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
            <Calendar size={14} />
            <span>Joined {formatDate(player.joined_date)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
            <Wallet size={14} />
            <span>Monthly fee: {formatNPR(player.monthly_fee)}</span>
          </div>
          {player.notes && (
            <p className="text-xs text-[var(--color-muted)] bg-[var(--color-surface-alt)] rounded-xl p-2.5 mt-2">
              {player.notes}
            </p>
          )}
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Total Paid"
          value={formatNPR(totalPaid)}
          icon={<TrendingUp size={18} />}
          accentColor="var(--color-paid)"
        />
        <StatCard
          label="Total Pending"
          value={formatNPR(totalPending)}
          icon={<AlertCircle size={18} />}
          accentColor={totalPending > 0 ? 'var(--color-unpaid)' : 'var(--color-muted)'}
        />
      </div>

      {/* Payment history */}
      <section>
        <h3 className="text-sm font-bold text-[var(--color-charcoal)] mb-3">Payment History</h3>

        {payments.length === 0 ? (
          <Card>
            <p className="text-sm text-center text-[var(--color-muted)] py-6">No payment records yet</p>
          </Card>
        ) : (
          <div className="bg-white rounded-2xl border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
            {payments.map(p => (
              <div key={p.id} className="px-4 py-3.5 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-[var(--color-charcoal)]">
                      {MONTHS[p.month - 1]} {p.year}
                    </p>
                    <PaymentBadge status={p.status} size="sm" />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[var(--color-muted)]">
                    <span>Due: {formatNPR(p.amount_due)}</span>
                    <span>Paid: {formatNPR(p.paid_amount)}</span>
                    {p.remaining_amount > 0 && (
                      <span className="text-[var(--color-partial)]">Pending: {formatNPR(p.remaining_amount)}</span>
                    )}
                  </div>
                  {p.paid_date && (
                    <p className="text-xs text-[var(--color-muted)]/70 mt-0.5">
                      Paid on {formatDate(p.paid_date)}
                      {p.payment_method && ` via ${p.payment_method.replace('_', ' ')}`}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  {p.status === 'paid' || p.status === 'overpaid' ? (
                    <span className="text-sm font-bold text-[var(--color-paid)] number-display">
                      +{formatNPR(p.paid_amount)}
                    </span>
                  ) : p.paid_amount > 0 ? (
                    <span className="text-sm font-bold text-[var(--color-partial)] number-display">
                      {formatNPR(p.paid_amount)}
                    </span>
                  ) : (
                    <span className="text-sm font-bold text-[var(--color-unpaid)] number-display">
                      {formatNPR(p.amount_due)} due
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
