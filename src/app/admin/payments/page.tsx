import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { PaymentsClient } from '@/components/admin/PaymentsClient';
import { getCurrentMonthYear } from '@/lib/utils/format';

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const sp = await searchParams;
  const { month: curMonth, year: curYear } = getCurrentMonthYear();
  const month = Number(sp.month || curMonth);
  const year = Number(sp.year || curYear);

  const supabase = await createClient();

  const [{ data: players }, { data: payments }] = await Promise.all([
    supabase.from('players').select('*').eq('status', 'active').order('full_name'),
    supabase.from('payments').select('*, player:players(*)').eq('month', month).eq('year', year),
  ]);

  // Merge: for each active player, find or create placeholder payment
  const paymentMap = new Map((payments || []).map(p => [p.player_id, p]));
  const merged = (players || []).map(player => ({
    player,
    payment: paymentMap.get(player.id) || null,
  }));

  return (
    <>
      <Header title="Monthly Payments" subtitle={`Track contributions`} />
      <PaymentsClient merged={merged} month={month} year={year} />
    </>
  );
}
