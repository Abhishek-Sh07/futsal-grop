'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Formation, FormationPlayer, MatchType } from '@/types';
import { formatDate } from '@/lib/utils/format';
import { toast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmModal } from '@/components/ui/Modal';
import { createClient } from '@/lib/supabase/client';
import { Plus, Copy, Trash2, Pencil, Share2, Layers, Users } from 'lucide-react';

type FormationWithPlayers = Formation & { formation_players: FormationPlayer[] };

interface Props {
  formations: FormationWithPlayers[];
}

const MATCH_TYPE_LABEL: Record<MatchType, string> = { '5v5': '5-a-side', '7v7': '7-a-side' };

export function FormationsClient({ formations }: Props) {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<FormationWithPlayers | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDuplicate = async (f: FormationWithPlayers) => {
    setLoading(true);
    const supabase = createClient();
    const { data: newF, error } = await supabase
      .from('formations')
      .insert({ name: `${f.name} (Copy)`, match_type: f.match_type, notes: f.notes })
      .select()
      .single();
    if (error || !newF) { toast.error('Failed to duplicate'); setLoading(false); return; }
    if (f.formation_players.length) {
      await supabase.from('formation_players').insert(
        f.formation_players.map(fp => ({
          formation_id: newF.id,
          player_id: fp.player_id,
          role: fp.role,
          position_x: fp.position_x,
          position_y: fp.position_y,
        }))
      );
    }
    toast.success('Formation duplicated');
    setLoading(false);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from('formations').delete().eq('id', deleteTarget.id);
    if (error) { toast.error('Failed to delete'); } else { toast.success('Formation deleted'); }
    setLoading(false);
    setDeleteTarget(null);
    router.refresh();
  };

  const handleShare = (f: FormationWithPlayers) => {
    const starters = f.formation_players.filter(fp => fp.role === 'starter');
    const subs = f.formation_players.filter(fp => fp.role === 'substitute');
    let text = `⚽ *${f.name}* (${MATCH_TYPE_LABEL[f.match_type]})\n\n`;
    if (starters.length) text += `*Starters (${starters.length}):*\n${starters.map((_, i) => `${i + 1}. Player`).join('\n')}\n`;
    if (subs.length) text += `\n*Substitutes (${subs.length})*\n`;
    text += `\n🔗 futsal-grop.vercel.app`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="px-4 pt-4 space-y-4">
      <div className="flex justify-end">
        <Link href="/admin/formations/new">
          <Button leftIcon={<Plus size={16} />}>New Lineup</Button>
        </Link>
      </div>

      {formations.length === 0 ? (
        <EmptyState
          icon={<Layers size={28} />}
          title="No lineups yet"
          description="Create your first formation to get started"
          action={
            <Link href="/admin/formations/new">
              <Button leftIcon={<Plus size={16} />}>New Lineup</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {formations.map(f => {
            const starters = f.formation_players.filter(fp => fp.role === 'starter').length;
            const subs = f.formation_players.filter(fp => fp.role === 'substitute').length;
            return (
              <div key={f.id} className="bg-white rounded-2xl border border-[var(--color-border)] p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
                    <Layers size={18} className="text-[var(--color-primary)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[var(--color-charcoal)] truncate">{f.name}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs font-semibold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2 py-0.5 rounded-full">
                        {MATCH_TYPE_LABEL[f.match_type]}
                      </span>
                      <span className="text-xs text-[var(--color-muted)] flex items-center gap-1">
                        <Users size={10} /> {starters} starters{subs > 0 ? `, ${subs} subs` : ''}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--color-muted)] mt-0.5">{formatDate(f.updated_at)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 pt-3 border-t border-[var(--color-border)]">
                  <Link
                    href={`/admin/formations/${f.id}`}
                    className="flex flex-col items-center gap-1 py-2 rounded-xl hover:bg-[var(--color-surface-alt)] transition-colors text-[var(--color-primary)]"
                  >
                    <Pencil size={16} />
                    <span className="text-xs font-medium">Edit</span>
                  </Link>
                  <button
                    onClick={() => handleDuplicate(f)}
                    disabled={loading}
                    className="flex flex-col items-center gap-1 py-2 rounded-xl hover:bg-[var(--color-surface-alt)] transition-colors text-[var(--color-muted)]"
                  >
                    <Copy size={16} />
                    <span className="text-xs font-medium">Copy</span>
                  </button>
                  <button
                    onClick={() => handleShare(f)}
                    className="flex flex-col items-center gap-1 py-2 rounded-xl hover:bg-[var(--color-surface-alt)] transition-colors text-green-600"
                  >
                    <Share2 size={16} />
                    <span className="text-xs font-medium">Share</span>
                  </button>
                  <button
                    onClick={() => setDeleteTarget(f)}
                    className="flex flex-col items-center gap-1 py-2 rounded-xl hover:bg-red-50 transition-colors text-red-500"
                  >
                    <Trash2 size={16} />
                    <span className="text-xs font-medium">Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Formation"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        loading={loading}
      />
    </div>
  );
}
