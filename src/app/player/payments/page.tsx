import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { PlayerPaymentsClient } from '@/components/player/PlayerPaymentsClient';
import { redirect } from 'next/navigation';

export default async function PlayerPaymentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('email').eq('user_id', user.id).single();
  const { data: player } = await supabase.from('players').select('*').eq('email', profile?.email || '').single();

  const { data: payments } = player
    ? await supabase.from('payments').select('*').eq('player_id', player.id).order('year', { ascending: false }).order('month', { ascending: false })
    : { data: [] };

  const totalPaid = (payments || []).reduce((s, p) => s + p.paid_amount, 0);
  const totalPending = (payments || []).reduce((s, p) => s + Math.max(0, p.amount_due - p.paid_amount), 0);

  return (
    <>
      <Header title="My Payments" subtitle="Your contribution history" />
      <PlayerPaymentsClient player={player} payments={payments || []} totalPaid={totalPaid} totalPending={totalPending} />
    </>
  );
}
