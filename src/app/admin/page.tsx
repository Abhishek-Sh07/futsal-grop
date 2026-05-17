import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { AdminDashboardClient } from '@/components/admin/AdminDashboardClient';
import { getCurrentMonthYear, formatNPR, formatMonthYear } from '@/lib/utils/format';
import { Settings, Bell } from 'lucide-react';
import Link from 'next/link';

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { month, year } = getCurrentMonthYear();

  // Fetch all needed data in parallel
  const [
    { data: players },
    { data: payments },
    { data: expenses },
    { data: announcements },
    { data: profile },
    { data: { user } }
  ] = await Promise.all([
    supabase.from('players').select('*').order('full_name'),
    supabase.from('payments').select('*, player:players(*)').eq('month', month).eq('year', year),
    supabase.from('expenses').select('*').order('expense_date', { ascending: false }),
    supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(3),
    supabase.from('profiles').select('full_name').single(),
    supabase.auth.getUser(),
  ]);

  const activePlayers = (players || []).filter(p => p.status === 'active');
  const monthlyTarget = activePlayers.reduce((sum, p) => sum + p.monthly_fee, 0);

  const totalCollected = (payments || []).reduce((sum, p) => sum + p.paid_amount, 0);
  const pendingAmount = (payments || []).reduce((sum, p) => sum + Math.max(0, p.amount_due - p.paid_amount), 0);

  const monthExpenses = (expenses || []).filter(e => {
    const d = new Date(e.expense_date);
    return d.getMonth() + 1 === month && d.getFullYear() === year;
  });
  const totalExpenses = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Opening balance (all time collected - all time expenses)
  const allTimeCollected = 0; // would need separate query for all months
  const allTimeExpenses = (expenses || []).reduce((sum, e) => sum + e.amount, 0);
  const currentBalance = totalCollected - totalExpenses;

  const paidCount = (payments || []).filter(p => p.status === 'paid').length;
  const unpaidCount = (payments || []).filter(p => p.status === 'unpaid').length;
  const partialCount = (payments || []).filter(p => p.status === 'partial').length;
  const overpaidCount = (payments || []).filter(p => p.status === 'overpaid').length;

  // Recent activity
  const recentPayments = (payments || [])
    .filter(p => p.paid_amount > 0 && p.paid_date)
    .sort((a, b) => new Date(b.paid_date!).getTime() - new Date(a.paid_date!).getTime())
    .slice(0, 5);

  const recentExpenses = (expenses || []).slice(0, 3);

  const unpaidPlayers = (payments || [])
    .filter(p => p.status === 'unpaid' || p.status === 'partial')
    .sort((a, b) => (b.remaining_amount || 0) - (a.remaining_amount || 0));

  const stats = {
    totalPlayers: (players || []).length,
    activePlayers: activePlayers.length,
    monthlyTarget,
    totalCollected,
    pendingAmount,
    totalExpenses,
    currentBalance,
    paidCount,
    unpaidCount,
    partialCount,
    overpaidCount,
  };

  return (
    <>
      <Header
        title="Futsal Hisab"
        subtitle={`Admin • ${formatMonthYear(month, year)}`}
        right={
          <Link href="/admin/settings" className="w-9 h-9 flex items-center justify-center rounded-xl text-[var(--color-muted)] hover:bg-gray-100 transition-colors">
            <Settings size={20} />
          </Link>
        }
      />
      <AdminDashboardClient
        stats={stats}
        month={month}
        year={year}
        recentPayments={recentPayments}
        recentExpenses={recentExpenses}
        unpaidPlayers={unpaidPlayers}
        announcements={announcements || []}
        adminName={profile?.full_name || 'Admin'}
      />
    </>
  );
}
