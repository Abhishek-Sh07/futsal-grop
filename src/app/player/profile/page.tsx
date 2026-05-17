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

  return (
    <>
      <Header title="My Profile" />
      <PlayerProfileClient profile={profile} player={player} />
    </>
  );
}
