'use client';

import { useState } from 'react';
import { Player, Payment, MONTHS } from '@/types';
import { formatNPR, formatDate } from '@/lib/utils/format';
import { PaymentBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { toast } from '@/components/ui/Toast';
import { generateReminderMessage } from '@/lib/utils/reminder';
import { Wallet, Copy, Check } from 'lucide-react';

interface Props {
  player: Player | null;
  payments: Payment[];
  totalPaid: number;
  totalPending: number;
}

export function PlayerPaymentsClient({ player, payments, totalPaid, totalPending }: Props) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyConfirmation = async (p: Payment) => {
    if (!player) return;
    const msg = `✅ Payment Confirmed!\n${player.full_name} paid ${formatNPR(p.paid_amount)} for ${MONTHS[p.month - 1]} ${p.year}${p.payment_method ? ` via ${p.payment_method}` : ''}${p.paid_date ? ` on ${formatDate(p.paid_date)}` : ''}.\nThank you! 🙏`;
    await navigator.clipboard.writeText(msg);
    setCopiedId(p.id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('Confirmation copied!');
  };

  return (
    <div className="px-4 pt-4 space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[var(--color-paid-bg)] rounded-2xl p-4">
          <p className="text-xs text-[var(--color-paid)] font-medium uppercase tracking-wide">Total Paid</p>
          <p className="text-2xl font-bold text-[var(--color-paid)] number-display mt-1">{formatNPR(totalPaid)}</p>
          <p className="text-xs text-[var(--color-paid)]/70 mt-0.5">{payments.filter(p => p.paid_amount > 0).length} payments</p>
        </div>
        <div className={`rounded-2xl p-4 ${totalPending > 0 ? 'bg-[var(--color-unpaid-bg)]' : 'bg-[var(--color-surface-alt)]'}`}>
          <p className={`text-xs font-medium uppercase tracking-wide ${totalPending > 0 ? 'text-[var(--color-unpaid)]' : 'text-[var(--color-muted)]'}`}>
            Pending
          </p>
          <p className={`text-2xl font-bold number-display mt-1 ${totalPending > 0 ? 'text-[var(--color-unpaid)]' : 'text-[var(--color-muted)]'}`}>
            {formatNPR(totalPending)}
          </p>
          <p className={`text-xs mt-0.5 ${totalPending > 0 ? 'text-[var(--color-unpaid)]/70' : 'text-[var(--color-muted)]'}`}>
            {totalPending > 0 ? 'needs clearing' : 'all clear ✓'}
          </p>
        </div>
      </div>

      {/* Payment history */}
      <section>
        <h3 className="text-sm font-bold text-[var(--color-charcoal)] mb-3">Payment History</h3>

        {payments.length === 0 ? (
          <EmptyState
            icon={<Wallet size={28} />}
            title="No payments yet"
            description="Your payment history will appear here"
          />
        ) : (
          <div className="space-y-2 pb-2">
            {payments.map(p => (
              <div key={p.id} className="bg-white rounded-2xl border border-[var(--color-border)] p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    p.status === 'paid' ? 'bg-[var(--color-paid-bg)]' :
                    p.status === 'partial' ? 'bg-[var(--color-partial-bg)]' :
                    p.status === 'overpaid' ? 'bg-[var(--color-overpaid-bg)]' :
                    'bg-[var(--color-unpaid-bg)]'
                  }`}>
                    <Wallet size={18} className={
                      p.status === 'paid' ? 'text-[var(--color-paid)]' :
                      p.status === 'partial' ? 'text-[var(--color-partial)]' :
                      p.status === 'overpaid' ? 'text-[var(--color-overpaid)]' :
                      'text-[var(--color-unpaid)]'
                    } />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-[var(--color-charcoal)]">{MONTHS[p.month - 1]} {p.year}</p>
                      <PaymentBadge status={p.status} size="sm" />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[var(--color-muted)] mt-0.5">
                      <span>Due: {formatNPR(p.amount_due)}</span>
                      {p.payment_method && <span className="capitalize">{p.payment_method.replace('_', ' ')}</span>}
                    </div>
                    {p.paid_date && <p className="text-xs text-[var(--color-muted)] mt-0.5">{formatDate(p.paid_date)}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-base font-bold number-display ${p.paid_amount > 0 ? 'text-[var(--color-paid)]' : 'text-[var(--color-muted)]'}`}>
                      {formatNPR(p.paid_amount)}
                    </p>
                    {p.remaining_amount > 0 && (
                      <p className="text-xs text-[var(--color-partial)]">{formatNPR(p.remaining_amount)} due</p>
                    )}
                  </div>
                </div>

                {(p.status === 'paid' || p.status === 'overpaid') && (
                  <button
                    onClick={() => handleCopyConfirmation(p)}
                    className="w-full h-8 rounded-xl border border-[var(--color-border)] text-xs font-semibold text-[var(--color-muted)] hover:bg-gray-50 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    {copiedId === p.id ? <><Check size={12} className="text-[var(--color-paid)]" /> Copied!</> : <><Copy size={12} /> Copy Confirmation</>}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
