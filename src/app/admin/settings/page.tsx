import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { SettingsClient } from '@/components/admin/SettingsClient';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user!.id)
    .single();

  return (
    <>
      <Header
        title="Settings"
        left={
          <Link href="/admin" className="w-9 h-9 flex items-center justify-center rounded-xl text-[var(--color-muted)] hover:bg-gray-100">
            <ArrowLeft size={20} />
          </Link>
        }
      />
      <SettingsClient profile={profile} />
    </>
  );
}
