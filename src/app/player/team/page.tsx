import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { TeamSummaryClient } from '@/components/player/TeamSummaryClient';
import { getCurrentMonthYear } from '@/lib/utils/format';

export default async function TeamSummaryPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const sp = await searchParams;
  const { month: curMonth, year: curYear } = getCurrentMonthYear();
  const month = Number(sp.month || curMonth);
  const year = Number(sp.year || curYear);

  const supabase = await createClient();

  const [{ data: players }, { data: payments }, { data: allPayments }, { data: expenses }, { data: profiles }] = await Promise.all([
    supabase.from('players').select('id, full_name, status, monthly_fee').eq('status', 'active').order('full_name'),
    supabase.from('payments').select('player_id, paid_amount, amount_due, status, remaining_amount').eq('month', month).eq('year', year),
    supabase.from('payments').select('month, year, paid_amount, status'),
    supabase.from('expenses').select('amount, category, expense_date'),
    supabase.from('player_profiles').select('player_id, photo_url'),
  ]);

  const paymentMap = new Map((payments || []).map(p => [p.player_id, p]));

  // Monthly history: group all payments by month+year
  const historyMap = new Map<string, { month: number; year: number; total: number; paidCount: number }>();
  for (const p of allPayments || []) {
    const key = `${p.year}-${p.month}`;
    const existing = historyMap.get(key);
    if (existing) {
      existing.total += p.paid_amount;
      if (p.status === 'paid' || p.status === 'overpaid') existing.paidCount++;
    } else {
      historyMap.set(key, { month: p.month, year: p.year, total: p.paid_amount, paidCount: (p.status === 'paid' || p.status === 'overpaid') ? 1 : 0 });
    }
  }
  const monthlyHistory = Array.from(historyMap.values())
    .sort((a, b) => b.year - a.year || b.month - a.month);

  const totalEver = (allPayments || []).reduce((s, p) => s + p.paid_amount, 0);
  const totalExpensesEver = (expenses || []).reduce((s, e) => s + e.amount, 0);
  const teamBalance = totalEver - totalExpensesEver;

  const monthExpenses = (expenses || []).filter(e => {
    const d = new Date(e.expense_date);
    return d.getMonth() + 1 === month && d.getFullYear() === year;
  });
  const monthExpensesTotal = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const monthCollected = (payments || []).reduce((s, p) => s + p.paid_amount, 0);
  const monthTarget = (players || []).reduce((s, p) => s + p.monthly_fee, 0);

  const photoMap = new Map(
    (profiles || []).filter(p => p.photo_url).map(p => [p.player_id, p.photo_url as string])
  );

  return (
    <>
      <Header title="Team Summary" subtitle="Fund overview" />
      <TeamSummaryClient
        players={players || []}
        paymentMap={paymentMap}
        photoMap={photoMap}
        monthlyHistory={monthlyHistory}
        teamBalance={teamBalance}
        monthCollected={monthCollected}
        monthTarget={monthTarget}
        monthExpensesTotal={monthExpensesTotal}
        month={month}
        year={year}
      />
    </>
  );
}
