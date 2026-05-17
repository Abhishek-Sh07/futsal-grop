import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { PlayerDashboardClient } from '@/components/player/PlayerDashboardClient';
import { getCurrentMonthYear } from '@/lib/utils/format';
import { redirect } from 'next/navigation';

export default async function PlayerDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { month, year } = getCurrentMonthYear();

  const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();

  // Find the player record matching the profile email
  const { data: player } = await supabase
    .from('players')
    .select('*')
    .eq('email', profile?.email || '')
    .single();

  const [{ data: payments }, { data: announcements }, { data: allPayments }, { data: allExpenses }] = await Promise.all([
    player
      ? supabase.from('payments').select('*').eq('player_id', player.id).order('year', { ascending: false }).order('month', { ascending: false })
      : Promise.resolve({ data: [] }),
    supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(5),
    supabase.from('payments').select('paid_amount'),
    supabase.from('expenses').select('amount'),
  ]);

  const thisMonthPayment = payments?.find(p => p.month === month && p.year === year) || null;
  const totalPaid = (payments || []).reduce((s, p) => s + p.paid_amount, 0);
  const totalPending = (payments || []).reduce((s, p) => s + Math.max(0, p.amount_due - p.paid_amount), 0);

  const teamCollected = (allPayments || []).reduce((s, p) => s + p.paid_amount, 0);
  const teamExpenses = (allExpenses || []).reduce((s, e) => s + e.amount, 0);
  const teamBalance = teamCollected - teamExpenses;

  return (
    <>
      <Header
        title="Futsal Hisab"
        subtitle={profile?.full_name || 'Player'}
      />
      <PlayerDashboardClient
        player={player}
        profile={profile}
        thisMonthPayment={thisMonthPayment}
        payments={payments || []}
        announcements={announcements || []}
        totalPaid={totalPaid}
        totalPending={totalPending}
        teamBalance={teamBalance}
        month={month}
        year={year}
      />
    </>
  );
}
