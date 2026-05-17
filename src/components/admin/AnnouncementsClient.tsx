'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Announcement } from '@/types';
import { formatDateTime } from '@/lib/utils/format';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { Input, TextArea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { toast } from '@/components/ui/Toast';
import { createClient } from '@/lib/supabase/client';
import { Plus, Megaphone, Pencil, Trash2 } from 'lucide-react';

const FORM_INIT = { title: '', message: '' };

interface Props {
  announcements: Announcement[];
}

export function AnnouncementsClient({ announcements }: Props) {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);
  const [editAnn, setEditAnn] = useState<Announcement | null>(null);
  const [deleteAnn, setDeleteAnn] = useState<Announcement | null>(null);
  const [form, setForm] = useState(FORM_INIT);
  const [saving, setSaving] = useState(false);

  const openEdit = (a: Announcement) => {
    setEditAnn(a);
    setForm({ title: a.title, message: a.message });
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.message.trim()) { toast.error('Message is required'); return; }
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (editAnn) {
      const { error } = await supabase.from('announcements')
        .update({ title: form.title.trim(), message: form.message.trim(), updated_at: new Date().toISOString() })
        .eq('id', editAnn.id);
      if (error) { toast.error('Failed to update'); setSaving(false); return; }
      toast.success('Announcement updated');
      setEditAnn(null);
    } else {
      const { error } = await supabase.from('announcements')
        .insert({ title: form.title.trim(), message: form.message.trim(), created_by: user?.id });
      if (error) { toast.error('Failed to post'); setSaving(false); return; }
      toast.success('Announcement posted');
      setAddOpen(false);
    }
    setSaving(false);
    setForm(FORM_INIT);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!deleteAnn) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from('announcements').delete().eq('id', deleteAnn.id);
    if (error) { toast.error('Failed to delete'); }
    else { toast.success('Announcement deleted'); }
    setSaving(false);
    setDeleteAnn(null);
    router.refresh();
  };

  const AnnForm = () => (
    <div className="space-y-4">
      <Input label="Title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Next match schedule" />
      <TextArea label="Message *" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Type your announcement here..." rows={5} />
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={() => { setAddOpen(false); setEditAnn(null); }}>Cancel</Button>
        <Button className="flex-1" loading={saving} onClick={handleSave}>{editAnn ? 'Update' : 'Post'}</Button>
      </div>
    </div>
  );

  return (
    <div className="px-4 pt-4 space-y-4">
      <Button className="w-full" onClick={() => { setForm(FORM_INIT); setAddOpen(true); }} leftIcon={<Plus size={16} />}>
        New Announcement
      </Button>

      {announcements.length === 0 ? (
        <EmptyState
          icon={<Megaphone size={28} />}
          title="No announcements yet"
          description="Post updates for your team members"
        />
      ) : (
        <div className="space-y-3 pb-2">
          {announcements.map(ann => (
            <div key={ann.id} className="bg-white rounded-2xl border border-[var(--color-border)] p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
                  <Megaphone size={16} className="text-[var(--color-primary)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[var(--color-charcoal)]">{ann.title}</p>
                  <p className="text-xs text-[var(--color-muted)]">{formatDateTime(ann.created_at)}</p>
                </div>
              </div>
              <p className="text-sm text-[var(--color-charcoal)] leading-relaxed mb-3">{ann.message}</p>
              <div className="flex gap-2 pt-3 border-t border-[var(--color-border)]">
                <button
                  onClick={() => openEdit(ann)}
                  className="flex-1 h-8 rounded-lg border border-[var(--color-border)] text-xs font-semibold text-[var(--color-charcoal)] hover:bg-gray-50 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Pencil size={12} /> Edit
                </button>
                <button
                  onClick={() => setDeleteAnn(ann)}
                  className="flex-1 h-8 rounded-lg border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="New Announcement">
        <AnnForm />
      </Modal>
      <Modal open={!!editAnn} onClose={() => setEditAnn(null)} title="Edit Announcement">
        <AnnForm />
      </Modal>
      <ConfirmModal
        open={!!deleteAnn}
        onClose={() => setDeleteAnn(null)}
        onConfirm={handleDelete}
        title="Delete Announcement"
        message={`Delete "${deleteAnn?.title}"?`}
        confirmLabel="Delete"
        confirmVariant="danger"
        loading={saving}
      />
    </div>
  );
}
