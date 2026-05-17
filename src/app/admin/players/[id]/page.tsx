import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { PlayerDetailClient } from '@/components/admin/PlayerDetailClient';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function PlayerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: player }, { data: payments }] = await Promise.all([
    supabase.from('players').select('*').eq('id', id).single(),
    supabase.from('payments').select('*').eq('player_id', id).order('year', { ascending: false }).order('month', { ascending: false }),
  ]);

  if (!player) notFound();

  const totalPaid = (payments || []).reduce((sum, p) => sum + p.paid_amount, 0);
  const totalPending = (payments || []).reduce((sum, p) => sum + Math.max(0, p.amount_due - p.paid_amount), 0);

  return (
    <>
      <Header
        title={player.full_name}
        subtitle="Player Details"
        left={
          <Link href="/admin/players" className="w-9 h-9 flex items-center justify-center rounded-xl text-[var(--color-muted)] hover:bg-gray-100 transition-colors">
            <ArrowLeft size={20} />
          </Link>
        }
      />
      <PlayerDetailClient player={player} payments={payments || []} totalPaid={totalPaid} totalPending={totalPending} />
    </>
  );
}
