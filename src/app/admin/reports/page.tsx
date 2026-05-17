import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { ReportsClient } from '@/components/admin/ReportsClient';

export default async function ReportsPage() {
  const supabase = await createClient();

  const [{ data: players }, { data: payments }, { data: expenses }] = await Promise.all([
    supabase.from('players').select('*').order('full_name'),
    supabase.from('payments').select('*, player:players(full_name, phone)').order('year', { ascending: false }).order('month', { ascending: false }),
    supabase.from('expenses').select('*').order('expense_date', { ascending: false }),
  ]);

  return (
    <>
      <Header title="Reports" subtitle="Team financial overview" />
      <ReportsClient players={players || []} payments={payments || []} expenses={expenses || []} />
    </>
  );
}
