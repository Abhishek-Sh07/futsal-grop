import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { BottomNav } from '@/components/layout/BottomNav';

export default async function PlayerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (profile?.role === 'admin') redirect('/admin');

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <main className="pb-nav">
        {children}
      </main>
      <BottomNav role="player" />
    </div>
  );
}
