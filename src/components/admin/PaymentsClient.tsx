'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Player, Payment, PaymentStatus, PAYMENT_METHODS, MONTHS } from '@/types';
import { formatNPR, formatMonthYear, cn, getMonthOptions } from '@/lib/utils/format';
import { generateReminderMessage, getWhatsAppUrl } from '@/lib/utils/reminder';
import { PaymentBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Input, Select, TextArea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';
import {
  Search, ChevronDown, CheckCircle2, MessageCircle, Copy,
  Check, Filter, CalendarDays, Wallet
} from 'lucide-react';
import Link from 'next/link';

type MergedRow = { player: Player; payment: Payment | null };
type FilterStatus = 'all' | 'paid' | 'unpaid' | 'partial' | 'overpaid';

const PAYMENT_FORM_INIT = {
  paid_amount: '',
  payment_method: 'cash',
  paid_date: new Date().toISOString().split('T')[0],
  notes: '',
};

interface Props {
  merged: MergedRow[];
  photoMap: Map<string, string>;
  month: number;
  year: number;
}

export function PaymentsClient({ merged, photoMap, month, year }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [selectedMonth, setSelectedMonth] = useState(month);
  const [selectedYear, setSelectedYear] = useState(year);
  const [paymentModal, setPaymentModal] = useState<MergedRow | null>(null);
  const [reminderModal, setReminderModal] = useState<MergedRow | null>(null);
  const [form, setForm] = useState(PAYMENT_FORM_INIT);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const monthOptions = getMonthOptions(12);

  const filtered = merged.filter(({ player, payment }) => {
    const matchSearch = player.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (player.phone || '').includes(search);
    if (!matchSearch) return false;
    if (filter === 'all') return true;
    const status = payment?.status || 'unpaid';
    return status === filter;
  });

  const totalCollected = merged.reduce((s, r) => s + (r.payment?.paid_amount || 0), 0);
  const totalTarget = merged.reduce((s, r) => s + r.player.monthly_fee, 0);
  const paidCount = merged.filter(r => r.payment?.status === 'paid').length;
  const unpaidCount = merged.filter(r => !r.payment || r.payment.status === 'unpaid').length;
  const partialCount = merged.filter(r => r.payment?.status === 'partial').length;

  const openPaymentModal = (row: MergedRow) => {
    setPaymentModal(row);
    setForm({
      paid_amount: row.payment?.paid_amount ? String(row.payment.paid_amount) : String(row.player.monthly_fee),
      payment_method: row.payment?.payment_method || 'cash',
      paid_date: row.payment?.paid_date || new Date().toISOString().split('T')[0],
      notes: row.payment?.notes || '',
    });
  };

  const handleSavePayment = async () => {
    if (!paymentModal) return;
    if (!form.paid_amount || Number(form.paid_amount) < 0) { toast.error('Enter valid amount'); return; }
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const payload = {
      player_id: paymentModal.player.id,
      month: selectedMonth,
      year: selectedYear,
      amount_due: paymentModal.player.monthly_fee,
      paid_amount: Number(form.paid_amount),
      payment_method: form.payment_method || null,
      paid_date: form.paid_date || null,
      notes: form.notes.trim() || null,
      updated_by: user?.id,
    };

    if (paymentModal.payment) {
      // Log the change
      await supabase.from('payment_logs').insert({
        payment_id: paymentModal.payment.id,
        action_type: 'update',
        old_amount: paymentModal.payment.paid_amount,
        new_amount: Number(form.paid_amount),
        old_status: paymentModal.payment.status,
        changed_by: user?.id,
        notes: form.notes.trim() || null,
      });
      const { error } = await supabase.from('payments').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', paymentModal.payment.id);
      if (error) { toast.error('Failed to update payment'); setSaving(false); return; }
    } else {
      const { error } = await supabase.from('payments').insert({ ...payload, created_by: user?.id });
      if (error) { toast.error('Failed to save payment'); setSaving(false); return; }
    }

    toast.success(`Payment saved for ${paymentModal.player.full_name}`);
    setSaving(false);
    setPaymentModal(null);
    router.refresh();
  };

  const handleMonthChange = (val: string) => {
    const [m, y] = val.split('-').map(Number);
    setSelectedMonth(m);
    setSelectedYear(y);
    router.push(`/admin/payments?month=${m}&year=${y}`);
  };

  const reminderMessage = reminderModal
    ? generateReminderMessage(
        reminderModal.player.full_name,
        (reminderModal.payment?.remaining_amount ?? reminderModal.player.monthly_fee),
        selectedMonth,
        selectedYear
      )
    : '';

  const handleCopyReminder = async () => {
    await navigator.clipboard.writeText(reminderMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Message copied!');
  };

  const FILTER_TABS: Array<{ key: FilterStatus; label: string; count?: number }> = [
    { key: 'all', label: 'All', count: merged.length },
    { key: 'unpaid', label: 'Unpaid', count: unpaidCount },
    { key: 'partial', label: 'Partial', count: partialCount },
    { key: 'paid', label: 'Paid', count: paidCount },
    { key: 'overpaid', label: 'Overpaid' },
  ];

  return (
    <div className="px-4 pt-4 space-y-4">
      {/* Month picker */}
      <div className="relative">
        <CalendarDays size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)] z-10" />
        <select
          value={`${selectedMonth}-${selectedYear}`}
          onChange={e => handleMonthChange(e.target.value)}
          className="w-full h-11 rounded-xl border border-[var(--color-border)] bg-white text-sm pl-10 pr-4 font-semibold text-[var(--color-charcoal)] appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
        >
          {monthOptions.map(opt => (
            <option key={`${opt.month}-${opt.year}`} value={`${opt.month}-${opt.year}`}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)] pointer-events-none" />
      </div>

      {/* Collection summary */}
      <div className="bg-[var(--color-primary)] rounded-2xl p-4 text-white">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-white/70 text-xs">Collected</p>
            <p className="text-2xl font-bold number-display">{formatNPR(totalCollected)}</p>
          </div>
          <div className="text-right">
            <p className="text-white/70 text-xs">Target</p>
            <p className="text-xl font-bold number-display">{formatNPR(totalTarget)}</p>
          </div>
        </div>
        <ProgressBar value={totalCollected} max={totalTarget} color="var(--color-accent)" height={6} />
        <div className="flex justify-between mt-3 text-xs text-white/70">
          <span>{paidCount} paid • {partialCount} partial • {unpaidCount} unpaid</span>
          <span>{totalTarget > 0 ? Math.round((totalCollected / totalTarget) * 100) : 0}%</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search player..."
          className="w-full h-10 rounded-xl border border-[var(--color-border)] bg-white text-sm pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1">
        {FILTER_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={cn(
              'shrink-0 h-8 px-3 rounded-full text-xs font-semibold transition-all flex items-center gap-1',
              filter === tab.key
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-white border border-[var(--color-border)] text-[var(--color-muted)]'
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={cn('text-[10px] rounded-full px-1', filter === tab.key ? 'bg-white/20' : 'bg-gray-100')}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Player payment rows */}
      <div className="space-y-2 pb-2">
        {filtered.map(({ player, payment }) => {
          const status: PaymentStatus = payment?.status || 'unpaid';
          const paidAmount = payment?.paid_amount || 0;
          const remaining = payment?.remaining_amount ?? player.monthly_fee;
          const photo = photoMap.get(player.id);

          return (
            <div key={player.id} className="bg-white rounded-2xl border border-[var(--color-border)] p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0 overflow-hidden relative">
                  {photo ? (
                    <Image src={photo} alt={player.full_name} fill className="object-cover object-top" />
                  ) : (
                    <span className="text-sm font-bold text-[var(--color-primary)]">{player.full_name.charAt(0)}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[var(--color-charcoal)] truncate">{player.full_name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <PaymentBadge status={status} size="sm" />
                    {remaining > 0 && status !== 'paid' && (
                      <span className="text-xs text-[var(--color-partial)] font-medium">{formatNPR(remaining)} due</span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className={cn(
                    'text-base font-bold number-display',
                    paidAmount > 0 ? 'text-[var(--color-paid)]' : 'text-[var(--color-muted)]'
                  )}>
                    {formatNPR(paidAmount)}
                  </p>
                  <p className="text-xs text-[var(--color-muted)]">of {formatNPR(player.monthly_fee)}</p>
                </div>
              </div>

              {/* Payment method + date */}
              {payment && payment.paid_date && (
                <div className="flex items-center gap-3 mb-3 text-xs text-[var(--color-muted)]">
                  {payment.payment_method && <span className="capitalize bg-[var(--color-surface-alt)] px-2 py-0.5 rounded-full">{payment.payment_method.replace('_', ' ')}</span>}
                  <span>{payment.paid_date}</span>
                </div>
              )}

              {/* Quick actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => openPaymentModal({ player, payment })}
                  className="flex-1 h-9 rounded-xl bg-[var(--color-primary)] text-white text-xs font-semibold hover:bg-[var(--color-primary-dark)] transition-colors flex items-center justify-center gap-1.5"
                >
                  <Wallet size={13} />
                  {payment?.paid_amount ? 'Edit Payment' : 'Mark Paid'}
                </button>
                {(status === 'unpaid' || status === 'partial') && player.phone && (
                  <button
                    onClick={() => setReminderModal({ player, payment })}
                    className="h-9 px-3 rounded-xl border border-[var(--color-border)] text-xs font-semibold text-[var(--color-muted)] hover:bg-gray-50 transition-colors flex items-center gap-1.5"
                  >
                    <MessageCircle size={13} />
                    Remind
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment modal */}
      <Modal
        open={!!paymentModal}
        onClose={() => setPaymentModal(null)}
        title={`Payment — ${paymentModal?.player.full_name}`}
      >
        {paymentModal && (
          <div className="space-y-4">
            <div className="bg-[var(--color-surface-alt)] rounded-xl p-3 flex items-center justify-between">
              <span className="text-sm text-[var(--color-muted)]">Amount Due</span>
              <span className="text-sm font-bold">{formatNPR(paymentModal.player.monthly_fee)}</span>
            </div>

            <Input
              label="Amount Paid (NPR)"
              value={form.paid_amount}
              onChange={e => setForm(f => ({ ...f, paid_amount: e.target.value }))}
              type="number"
              min="0"
              placeholder="1000"
            />

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Payment Method"
                value={form.payment_method}
                onChange={e => setForm(f => ({ ...f, payment_method: e.target.value }))}
                options={[
                  { value: 'cash', label: 'Cash' },
                  { value: 'esewa', label: 'eSewa' },
                  { value: 'khalti', label: 'Khalti' },
                  { value: 'bank_transfer', label: 'Bank Transfer' },
                  { value: 'other', label: 'Other' },
                ]}
              />
              <Input
                label="Payment Date"
                value={form.paid_date}
                onChange={e => setForm(f => ({ ...f, paid_date: e.target.value }))}
                type="date"
              />
            </div>

            <TextArea
              label="Notes (optional)"
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Any notes..."
              rows={2}
            />

            <div className="flex gap-3 pt-1">
              <Button variant="outline" className="flex-1" onClick={() => setPaymentModal(null)}>Cancel</Button>
              <Button className="flex-1" loading={saving} onClick={handleSavePayment}>Save Payment</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reminder modal */}
      <Modal
        open={!!reminderModal}
        onClose={() => setReminderModal(null)}
        title="Send Payment Reminder"
        size="sm"
      >
        {reminderModal && (
          <div className="space-y-4">
            <div className="bg-[var(--color-surface-alt)] rounded-xl p-3.5">
              <p className="text-sm text-[var(--color-charcoal)] leading-relaxed">{reminderMessage}</p>
            </div>
            <div className="flex flex-col gap-2.5">
              <button
                onClick={handleCopyReminder}
                className="w-full h-11 rounded-xl border-2 border-[var(--color-border)] text-sm font-semibold text-[var(--color-charcoal)] hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                {copied ? <Check size={16} className="text-[var(--color-paid)]" /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy Message'}
              </button>
              {reminderModal.player.phone && (
                <a
                  href={getWhatsAppUrl(reminderModal.player.phone, reminderMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-11 rounded-xl bg-[#25D366] text-white text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <MessageCircle size={16} />
                  Send via WhatsApp
                </a>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
