import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { formatDate } from '@/lib/utils/format';
import { Megaphone } from 'lucide-react';

export default async function PlayerAnnouncementsPage() {
  const supabase = await createClient();
  const { data: announcements } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <>
      <Header title="Team Updates" subtitle="Announcements from admin" />
      <div className="px-4 pt-4 space-y-3 pb-4">
        {!announcements?.length ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-alt)] flex items-center justify-center mb-4">
              <Megaphone size={28} className="text-[var(--color-muted)]" />
            </div>
            <p className="text-base font-semibold text-[var(--color-charcoal)]">No announcements yet</p>
            <p className="text-sm text-[var(--color-muted)] mt-1">Check back later for updates</p>
          </div>
        ) : (
          announcements.map(ann => (
            <div key={ann.id} className="bg-white rounded-2xl border border-[var(--color-border)] p-4">
              <div className="flex items-start gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Megaphone size={16} className="text-[var(--color-primary)]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-[var(--color-charcoal)]">{ann.title}</p>
                  <p className="text-xs text-[var(--color-muted)]">{formatDate(ann.created_at)}</p>
                </div>
              </div>
              <p className="text-sm text-[var(--color-charcoal)] leading-relaxed pl-12">{ann.message}</p>
            </div>
          ))
        )}
      </div>
    </>
  );
}
