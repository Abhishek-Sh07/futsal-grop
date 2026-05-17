import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { AnnouncementsClient } from '@/components/admin/AnnouncementsClient';

export default async function AnnouncementsPage() {
  const supabase = await createClient();
  const { data: announcements } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <>
      <Header title="Announcements" subtitle="Post team updates" />
      <AnnouncementsClient announcements={announcements || []} />
    </>
  );
}
