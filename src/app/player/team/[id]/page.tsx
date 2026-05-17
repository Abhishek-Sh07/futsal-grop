import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { PlayerPublicProfileClient } from '@/components/player/PlayerPublicProfileClient';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function PlayerPublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: player }, { data: stats }, { data: contribution }, { data: playerProfile }, { data: teamSettings }, { data: payments }] = await Promise.all([
    supabase.from('players').select('*').eq('id', id).single(),
    supabase.from('player_stats').select('*').eq('player_id', id).single(),
    supabase.from('player_contribution').select('*').eq('player_id', id).single(),
    supabase.from('player_profiles').select('*').eq('player_id', id).single(),
    supabase.from('team_settings').select('*').limit(1).single(),
    supabase.from('payments').select('status').eq('player_id', id),
  ]);

  if (!player) notFound();

  return (
    <>
      <Header
        title={player.full_name}
        subtitle="Player Profile"
        left={
          <Link href="/player/team" className="w-9 h-9 flex items-center justify-center rounded-xl text-[var(--color-muted)] hover:bg-gray-100 transition-colors">
            <ArrowLeft size={20} />
          </Link>
        }
      />
      <PlayerPublicProfileClient
        player={player}
        stats={stats}
        contribution={contribution}
        playerProfile={playerProfile}
        teamSettings={teamSettings}
        payments={payments ?? []}
      />
    </>
  );
}
