import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { ExpensesClient } from '@/components/admin/ExpensesClient';

export default async function ExpensesPage() {
  const supabase = await createClient();
  const { data: expenses } = await supabase
    .from('expenses')
    .select('*')
    .order('expense_date', { ascending: false });

  return (
    <>
      <Header title="Expenses" subtitle="Track team spending" />
      <ExpensesClient expenses={expenses || []} />
    </>
  );
}
