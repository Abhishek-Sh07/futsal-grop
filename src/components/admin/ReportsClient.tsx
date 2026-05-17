'use client';

import { useState } from 'react';
import { Player, Payment, Expense, MONTHS, EXPENSE_CATEGORIES, ExpenseCategory } from '@/types';
import { formatNPR, formatMonthYear, cn, getMonthOptions, getCurrentMonthYear } from '@/lib/utils/format';
import { PaymentBadge } from '@/components/ui/Badge';
import { toast } from '@/components/ui/Toast';
import { Download, BarChart3, TrendingDown, Users, Scale, ChevronDown } from 'lucide-react';

interface Props {
  players: Player[];
  payments: Payment[];
  expenses: Expense[];
}

type ReportTab = 'monthly' | 'players' | 'expenses' | 'balance';

export function ReportsClient({ players, payments, expenses }: Props) {
  const { month: curMonth, year: curYear } = getCurrentMonthYear();
  const [tab, setTab] = useState<ReportTab>('monthly');
  const [selectedMonth, setSelectedMonth] = useState(`${curMonth}-${curYear}`);
  const [selectedPlayer, setSelectedPlayer] = useState('all');

  const monthOptions = getMonthOptions(12);
  const [fm, fy] = selectedMonth.split('-').map(Number);

  const monthPayments = payments.filter(p => p.month === fm && p.year === fy);
  const monthExpenses = expenses.filter(e => {
    const d = new Date(e.expense_date);
    return d.getMonth() + 1 === fm && d.getFullYear() === fy;
  });

  const totalCollected = monthPayments.reduce((s, p) => s + p.paid_amount, 0);
  const totalPending = monthPayments.reduce((s, p) => s + Math.max(0, p.amount_due - p.paid_amount), 0);
  const totalExpenses = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const balance = totalCollected - totalExpenses;

  const playerPayments = selectedPlayer === 'all'
    ? payments
    : payments.filter(p => p.player_id === selectedPlayer);

  // All-time summary
  const allCollected = payments.reduce((s, p) => s + p.paid_amount, 0);
  const allExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const overallBalance = allCollected - allExpenses;

  // Expense by category
  const catTotals: Partial<Record<ExpenseCategory, number>> = {};
  monthExpenses.forEach(e => {
    catTotals[e.category] = (catTotals[e.category] || 0) + e.amount;
  });

  const downloadCSV = () => {
    let csv = '';
    if (tab === 'monthly') {
      csv = 'Player,Amount Due,Paid,Pending,Status,Method,Date\n';
      monthPayments.forEach(p => {
        const player = (p as Payment & { player?: { full_name: string } }).player;
        csv += `"${player?.full_name || ''}",${p.amount_due},${p.paid_amount},${Math.max(0, p.amount_due - p.paid_amount)},${p.status},${p.payment_method || ''},${p.paid_date || ''}\n`;
      });
    } else if (tab === 'expenses') {
      csv = 'Date,Title,Category,Amount,Paid By\n';
      monthExpenses.forEach(e => {
        csv += `${e.expense_date},"${e.title}",${e.category},${e.amount},"${e.paid_by || ''}"\n`;
      });
    } else if (tab === 'players') {
      csv = 'Player,Month,Year,Amount Due,Paid,Status\n';
      playerPayments.forEach(p => {
        const player = (p as Payment & { player?: { full_name: string } }).player;
        csv += `"${player?.full_name || ''}",${p.month},${p.year},${p.amount_due},${p.paid_amount},${p.status}\n`;
      });
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `futsal-hisab-${tab}-${selectedMonth}.csv`;
    a.click();
    toast.success('CSV downloaded');
  };

  const TABS: Array<{ key: ReportTab; label: string; icon: React.ReactNode }> = [
    { key: 'monthly', label: 'Monthly', icon: <BarChart3 size={14} /> },
    { key: 'players', label: 'Players', icon: <Users size={14} /> },
    { key: 'expenses', label: 'Expenses', icon: <TrendingDown size={14} /> },
    { key: 'balance', label: 'Balance', icon: <Scale size={14} /> },
  ];

  return (
    <div className="px-4 pt-4 space-y-4">
      {/* Tab navigation */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-[var(--color-surface-alt)] rounded-xl">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex items-center justify-center gap-1 h-9 rounded-lg text-xs font-semibold transition-all',
              tab === t.key
                ? 'bg-white text-[var(--color-primary)] shadow-sm'
                : 'text-[var(--color-muted)]'
            )}
          >
            {t.icon}
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Month selector (for monthly/expenses tabs) */}
      {(tab === 'monthly' || tab === 'expenses') && (
        <div className="relative">
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="w-full h-10 rounded-xl border border-[var(--color-border)] bg-white text-sm px-3 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
          >
            {monthOptions.map(opt => (
              <option key={`${opt.month}-${opt.year}`} value={`${opt.month}-${opt.year}`}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] pointer-events-none" />
        </div>
      )}

      {/* Download button */}
      <button
        onClick={downloadCSV}
        className="w-full h-10 rounded-xl border border-[var(--color-border)] bg-white text-sm font-semibold text-[var(--color-charcoal)] flex items-center justify-center gap-2 hover:bg-[var(--color-surface-alt)] transition-colors"
      >
        <Download size={15} /> Download CSV
      </button>

      {/* MONTHLY REPORT */}
      {tab === 'monthly' && (
        <div className="space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[var(--color-paid-bg)] rounded-2xl p-4">
              <p className="text-xs text-[var(--color-paid)] font-medium">Collected</p>
              <p className="text-xl font-bold text-[var(--color-paid)] number-display">{formatNPR(totalCollected)}</p>
            </div>
            <div className="bg-[var(--color-unpaid-bg)] rounded-2xl p-4">
              <p className="text-xs text-[var(--color-unpaid)] font-medium">Pending</p>
              <p className="text-xl font-bold text-[var(--color-unpaid)] number-display">{formatNPR(totalPending)}</p>
            </div>
            <div className="bg-[var(--color-partial-bg)] rounded-2xl p-4">
              <p className="text-xs text-[var(--color-partial)] font-medium">Expenses</p>
              <p className="text-xl font-bold text-[var(--color-partial)] number-display">{formatNPR(totalExpenses)}</p>
            </div>
            <div className={`rounded-2xl p-4 ${balance >= 0 ? 'bg-[var(--color-paid-bg)]' : 'bg-[var(--color-unpaid-bg)]'}`}>
              <p className={`text-xs font-medium ${balance >= 0 ? 'text-[var(--color-paid)]' : 'text-[var(--color-unpaid)]'}`}>Net Balance</p>
              <p className={`text-xl font-bold number-display ${balance >= 0 ? 'text-[var(--color-paid)]' : 'text-[var(--color-unpaid)]'}`}>{formatNPR(balance)}</p>
            </div>
          </div>

          {/* Payments list */}
          <div className="bg-white rounded-2xl border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
            <div className="px-4 py-2.5 grid grid-cols-[1fr_auto_auto] gap-2 text-xs font-bold text-[var(--color-muted)] uppercase">
              <span>Player</span>
              <span className="text-right">Paid</span>
              <span className="text-right">Status</span>
            </div>
            {monthPayments.length === 0 ? (
              <p className="text-sm text-center text-[var(--color-muted)] py-8">No payment records</p>
            ) : (
              monthPayments.map(p => {
                const player = (p as Payment & { player?: { full_name: string } }).player;
                return (
                  <div key={p.id} className="px-4 py-2.5 grid grid-cols-[1fr_auto_auto] gap-2 items-center">
                    <span className="text-sm truncate">{player?.full_name}</span>
                    <span className="text-sm font-semibold number-display">{formatNPR(p.paid_amount)}</span>
                    <PaymentBadge status={p.status} size="sm" />
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* PLAYER REPORT */}
      {tab === 'players' && (
        <div className="space-y-3">
          <div className="relative">
            <select
              value={selectedPlayer}
              onChange={e => setSelectedPlayer(e.target.value)}
              className="w-full h-10 rounded-xl border border-[var(--color-border)] bg-white text-sm px-3 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
            >
              <option value="all">All Players</option>
              {players.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] pointer-events-none" />
          </div>

          {players.filter(p => selectedPlayer === 'all' || p.id === selectedPlayer).map(player => {
            const pp = payments.filter(p => p.player_id === player.id);
            const paid = pp.reduce((s, p) => s + p.paid_amount, 0);
            const pending = pp.reduce((s, p) => s + Math.max(0, p.amount_due - p.paid_amount), 0);
            return (
              <div key={player.id} className="bg-white rounded-2xl border border-[var(--color-border)] p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold">{player.full_name}</p>
                  <div className="flex gap-2 text-xs">
                    <span className="text-[var(--color-paid)] font-semibold">{formatNPR(paid)} paid</span>
                    {pending > 0 && <span className="text-[var(--color-unpaid)] font-semibold">{formatNPR(pending)} due</span>}
                  </div>
                </div>
                {pp.length > 0 && (
                  <div className="space-y-1">
                    {pp.slice(0, 6).map(p => (
                      <div key={p.id} className="flex items-center justify-between text-xs py-0.5">
                        <span className="text-[var(--color-muted)]">{MONTHS[p.month - 1]} {p.year}</span>
                        <div className="flex items-center gap-2">
                          <span>{formatNPR(p.paid_amount)}</span>
                          <PaymentBadge status={p.status} size="sm" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* EXPENSES REPORT */}
      {tab === 'expenses' && (
        <div className="space-y-4">
          <div className="bg-[var(--color-unpaid-bg)] rounded-2xl p-4">
            <p className="text-xs text-[var(--color-unpaid)] font-medium">Total Expenses</p>
            <p className="text-2xl font-bold text-[var(--color-unpaid)] number-display">{formatNPR(totalExpenses)}</p>
            <p className="text-xs text-[var(--color-unpaid)]/70 mt-1">{monthExpenses.length} items</p>
          </div>

          {Object.entries(catTotals).length > 0 && (
            <div className="bg-white rounded-2xl border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
              {(Object.entries(catTotals) as [ExpenseCategory, number][]).map(([cat, amt]) => (
                <div key={cat} className="px-4 py-3 flex items-center justify-between">
                  <span className="text-sm">{EXPENSE_CATEGORIES[cat]}</span>
                  <span className="text-sm font-bold text-[var(--color-unpaid)] number-display">{formatNPR(amt)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="bg-white rounded-2xl border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
            {monthExpenses.map(e => (
              <div key={e.id} className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{e.title}</p>
                  <p className="text-sm font-bold text-[var(--color-unpaid)] number-display">{formatNPR(e.amount)}</p>
                </div>
                <p className="text-xs text-[var(--color-muted)] mt-0.5">{EXPENSE_CATEGORIES[e.category]} • {e.expense_date}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BALANCE REPORT */}
      {tab === 'balance' && (
        <div className="space-y-3">
          <div className="bg-[var(--color-primary)] rounded-2xl p-5 text-white">
            <p className="text-white/70 text-xs uppercase tracking-wide mb-1">Overall Team Balance</p>
            <p className="text-3xl font-bold number-display">{formatNPR(overallBalance)}</p>
            <div className="flex gap-6 mt-4 pt-4 border-t border-white/15">
              <div>
                <p className="text-white/60 text-xs">Total Collected</p>
                <p className="text-lg font-bold number-display">{formatNPR(allCollected)}</p>
              </div>
              <div>
                <p className="text-white/60 text-xs">Total Spent</p>
                <p className="text-lg font-bold text-red-300 number-display">{formatNPR(allExpenses)}</p>
              </div>
            </div>
          </div>

          <p className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wide">Monthly Breakdown</p>
          <div className="bg-white rounded-2xl border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
            {monthOptions.map(opt => {
              const mp = payments.filter(p => p.month === opt.month && p.year === opt.year);
              const me = expenses.filter(e => {
                const d = new Date(e.expense_date);
                return d.getMonth() + 1 === opt.month && d.getFullYear() === opt.year;
              });
              const mc = mp.reduce((s, p) => s + p.paid_amount, 0);
              const mx = me.reduce((s, e) => s + e.amount, 0);
              if (mc === 0 && mx === 0) return null;
              const nb = mc - mx;
              return (
                <div key={opt.label} className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{opt.label}</p>
                    <p className={cn('text-sm font-bold number-display', nb >= 0 ? 'text-[var(--color-paid)]' : 'text-[var(--color-unpaid)]')}>
                      {nb >= 0 ? '+' : ''}{formatNPR(nb)}
                    </p>
                  </div>
                  <div className="flex gap-4 mt-0.5 text-xs text-[var(--color-muted)]">
                    <span className="text-[var(--color-paid)]">In: {formatNPR(mc)}</span>
                    <span className="text-[var(--color-unpaid)]">Out: {formatNPR(mx)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
