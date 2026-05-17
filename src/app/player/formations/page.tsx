import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { FormationsClient } from '@/components/admin/FormationsClient';
import { Header } from '@/components/layout/Header';

export default async function PlayerFormationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: formations } = await supabase
    .from('formations')
    .select('*, formation_players(id, player_id, role, position_x, position_y)')
    .order('updated_at', { ascending: false });

  return (
    <>
      <Header title="Lineups" subtitle="Create & manage formations" />
      <main className="pb-24">
        <FormationsClient formations={formations ?? []} />
      </main>
    </>
  );
}
