import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { PlayersClient } from '@/components/admin/PlayersClient';
import { getCurrentMonthYear } from '@/lib/utils/format';

export default async function PlayersPage() {
  const supabase = await createClient();
  const { month, year } = getCurrentMonthYear();

  const [{ data: players }, { data: payments }, { data: profiles }] = await Promise.all([
    supabase.from('players').select('*').order('full_name'),
    supabase.from('payments').select('player_id, status, paid_amount, remaining_amount, amount_due')
      .eq('month', month).eq('year', year),
    supabase.from('player_profiles').select('player_id, photo_url'),
  ]);

  const paymentMap = new Map(
    (payments || []).map(p => [p.player_id, p])
  );
  const photoMap = new Map(
    (profiles || []).filter(p => p.photo_url).map(p => [p.player_id, p.photo_url as string])
  );

  return (
    <>
      <Header title="Players" subtitle={`${(players || []).filter(p => p.status === 'active').length} active`} />
      <PlayersClient players={players || []} paymentMap={paymentMap} photoMap={photoMap} month={month} year={year} />
    </>
  );
}
