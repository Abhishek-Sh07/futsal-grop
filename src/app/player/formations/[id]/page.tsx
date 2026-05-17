import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { FormationBuilderClient } from '@/components/admin/FormationBuilderClient';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PlayerFormationBuilderPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: players } = await supabase
    .from('players')
    .select('*')
    .eq('status', 'active')
    .order('full_name');

  let formation = null;
  let formationPlayers: unknown[] = [];

  if (id !== 'new') {
    const { data: f } = await supabase
      .from('formations')
      .select('*')
      .eq('id', id)
      .single();
    formation = f;

    const { data: fp } = await supabase
      .from('formation_players')
      .select('*')
      .eq('formation_id', id);
    formationPlayers = fp ?? [];
  }

  return (
    <FormationBuilderClient
      formation={formation}
      formationPlayers={formationPlayers as never}
      players={players ?? []}
    />
  );
}
