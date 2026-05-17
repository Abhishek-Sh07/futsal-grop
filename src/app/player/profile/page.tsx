import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { PlayerProfileClient } from '@/components/player/PlayerProfileClient';
import { redirect } from 'next/navigation';

export default async function PlayerProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
  const { data: player } = await supabase.from('players').select('*').eq('email', profile?.email || '').single();

  const [{ data: stats }, { data: contribution }, { data: payments }] = await Promise.all([
    supabase.from('player_stats').select('*').eq('player_id', player?.id || '').single(),
    supabase.from('player_contribution').select('*').eq('player_id', player?.id || '').single(),
    supabase.from('payments').select('status').eq('player_id', player?.id || ''),
  ]);

  return (
    <>
      <Header title="My Profile" />
      <PlayerProfileClient
        profile={profile}
        player={player}
        stats={stats}
        contribution={contribution}
        payments={payments ?? []}
      />
    </>
  );
}
