'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Player, PaymentStatus, PAYMENT_METHODS, PlayerStatus } from '@/types';
import { formatNPR, formatDate, cn } from '@/lib/utils/format';
import { PaymentBadge } from '@/components/ui/Badge';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Select, TextArea } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { toast } from '@/components/ui/Toast';
import { createClient } from '@/lib/supabase/client';
import {
  Search, Plus, Phone, Mail, Filter, UserMinus, UserCheck,
  ChevronRight, User
} from 'lucide-react';
import Link from 'next/link';

type PaymentRecord = {
  status: PaymentStatus;
  paid_amount: number;
  remaining_amount: number;
  amount_due: number;
};

interface Props {
  players: Player[];
  paymentMap: Map<string, PaymentRecord>;
  month: number;
  year: number;
}

type FilterStatus = 'all' | 'active' | 'inactive' | 'paid' | 'unpaid' | 'partial';

const INITIAL_FORM = {
  full_name: '', phone: '', email: '', monthly_fee: '1000',
  status: 'active' as PlayerStatus, joined_date: new Date().toISOString().split('T')[0], notes: '',
};

export function PlayersClient({ players, paymentMap, month, year }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [addOpen, setAddOpen] = useState(false);
  const [editPlayer, setEditPlayer] = useState<Player | null>(null);
  const [deactivatePlayer, setDeactivatePlayer] = useState<Player | null>(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);

  const filtered = players.filter(p => {
    const matchSearch = p.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (p.phone || '').includes(search);
    if (!matchSearch) return false;

    const payment = paymentMap.get(p.id);
    if (filter === 'active') return p.status === 'active';
    if (filter === 'inactive') return p.status === 'inactive';
    if (filter === 'paid') return payment?.status === 'paid';
    if (filter === 'unpaid') return payment?.status === 'unpaid' || !payment;
    if (filter === 'partial') return payment?.status === 'partial';
    return true;
  });

  const openAdd = () => { setForm(INITIAL_FORM); setAddOpen(true); };
  const openEdit = (p: Player) => {
    setEditPlayer(p);
    setForm({
      full_name: p.full_name, phone: p.phone || '', email: p.email || '',
      monthly_fee: String(p.monthly_fee), status: p.status,
      joined_date: p.joined_date, notes: p.notes || '',
    });
  };

  const handleSave = async () => {
    if (!form.full_name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    const supabase = createClient();
    const payload = {
      full_name: form.full_name.trim(),
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      monthly_fee: Number(form.monthly_fee) || 1000,
      status: form.status,
      joined_date: form.joined_date,
      notes: form.notes.trim() || null,
    };

    if (editPlayer) {
      const { error } = await supabase.from('players').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', editPlayer.id);
      if (error) { toast.error('Failed to update player'); setSaving(false); return; }
      toast.success('Player updated');
      setEditPlayer(null);
    } else {
      const { error } = await supabase.from('players').insert(payload);
      if (error) { toast.error('Failed to add player'); setSaving(false); return; }
      toast.success('Player added');
      setAddOpen(false);
    }
    setSaving(false);
    router.refresh();
  };

  const handleDeactivate = async () => {
    if (!deactivatePlayer) return;
    setSaving(true);
    const supabase = createClient();
    const newStatus = deactivatePlayer.status === 'active' ? 'inactive' : 'active';
    const { error } = await supabase.from('players').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', deactivatePlayer.id);
    if (error) { toast.error('Failed to update status'); }
    else { toast.success(`Player ${newStatus === 'active' ? 'activated' : 'deactivated'}`); }
    setSaving(false);
    setDeactivatePlayer(null);
    router.refresh();
  };

  const FILTER_TABS: Array<{ key: FilterStatus; label: string }> = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'unpaid', label: 'Unpaid' },
    { key: 'partial', label: 'Partial' },
    { key: 'paid', label: 'Paid' },
    { key: 'inactive', label: 'Inactive' },
  ];

  const PlayerForm = () => (
    <div className="space-y-4">
      <Input label="Full Name *" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Ram Bahadur Thapa" />
      <Input label="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="98XXXXXXXX" type="tel" />
      <Input label="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="player@example.com" type="email" />
      <Input label="Monthly Fee (NPR)" value={form.monthly_fee} onChange={e => setForm(f => ({ ...f, monthly_fee: e.target.value }))} type="number" min="0" />
      <Select
        label="Status"
        value={form.status}
        onChange={e => setForm(f => ({ ...f, status: e.target.value as PlayerStatus }))}
        options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]}
      />
      <Input label="Joined Date" value={form.joined_date} onChange={e => setForm(f => ({ ...f, joined_date: e.target.value }))} type="date" />
      <TextArea label="Notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional notes..." rows={2} />
      <div className="flex gap-3 pt-2">
        <Button variant="outline" className="flex-1" onClick={() => { setAddOpen(false); setEditPlayer(null); }}>Cancel</Button>
        <Button className="flex-1" loading={saving} onClick={handleSave}>{editPlayer ? 'Save Changes' : 'Add Player'}</Button>
      </div>
    </div>
  );

  return (
    <div className="px-4 pt-4 space-y-4">
      {/* Search + Add */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or phone..."
            className="w-full h-10 rounded-xl border border-[var(--color-border)] bg-white text-sm pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
          />
        </div>
        <Button size="md" onClick={openAdd} leftIcon={<Plus size={16} />}>Add</Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
        {FILTER_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={cn(
              'shrink-0 h-8 px-3.5 rounded-full text-xs font-semibold transition-all',
              filter === tab.key
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-white border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-charcoal)]'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Player list */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<User size={28} />}
          title="No players found"
          description="Try adjusting your search or filters"
          action={<Button onClick={openAdd} leftIcon={<Plus size={16} />}>Add Player</Button>}
        />
      ) : (
        <div className="space-y-2 pb-2">
          {filtered.map(player => {
            const payment = paymentMap.get(player.id);
            const isInactive = player.status === 'inactive';
            return (
              <div
                key={player.id}
                className={cn(
                  'bg-white rounded-2xl border border-[var(--color-border)] p-4',
                  isInactive && 'opacity-60'
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-[var(--color-primary)]">
                      {player.full_name.charAt(0)}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-bold text-[var(--color-charcoal)] truncate">{player.full_name}</p>
                      {isInactive && <span className="text-xs text-[var(--color-muted)] bg-gray-100 px-1.5 py-0.5 rounded-full">Inactive</span>}
                    </div>
                    {player.phone && (
                      <p className="text-xs text-[var(--color-muted)] flex items-center gap-1">
                        <Phone size={11} /> {player.phone}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      {payment ? (
                        <>
                          <PaymentBadge status={payment.status} size="sm" />
                          {payment.status !== 'paid' && payment.remaining_amount > 0 && (
                            <span className="text-xs text-[var(--color-partial)] font-medium">
                              {formatNPR(payment.remaining_amount)} due
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-[var(--color-muted)]">No record this month</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Link
                      href={`/admin/players/${player.id}`}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--color-muted)] hover:bg-[var(--color-surface-alt)] transition-colors"
                    >
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="flex gap-2 mt-3 pt-3 border-t border-[var(--color-border)]">
                  <button
                    onClick={() => openEdit(player)}
                    className="flex-1 h-8 rounded-lg border border-[var(--color-border)] text-xs font-semibold text-[var(--color-charcoal)] hover:bg-[var(--color-surface-alt)] transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeactivatePlayer(player)}
                    className={cn(
                      'flex-1 h-8 rounded-lg border text-xs font-semibold transition-colors',
                      player.status === 'active'
                        ? 'border-red-200 text-red-600 hover:bg-red-50'
                        : 'border-green-200 text-green-700 hover:bg-green-50'
                    )}
                  >
                    {player.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                  <Link
                    href={`/admin/players/${player.id}`}
                    className="flex-1 h-8 rounded-lg bg-[var(--color-primary)]/8 text-xs font-semibold text-[var(--color-primary)] hover:bg-[var(--color-primary)]/15 transition-colors flex items-center justify-center"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Player Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add New Player">
        <PlayerForm />
      </Modal>

      {/* Edit Player Modal */}
      <Modal open={!!editPlayer} onClose={() => setEditPlayer(null)} title="Edit Player">
        <PlayerForm />
      </Modal>

      {/* Deactivate confirm */}
      <ConfirmModal
        open={!!deactivatePlayer}
        onClose={() => setDeactivatePlayer(null)}
        onConfirm={handleDeactivate}
        title={deactivatePlayer?.status === 'active' ? 'Deactivate Player' : 'Activate Player'}
        message={`Are you sure you want to ${deactivatePlayer?.status === 'active' ? 'deactivate' : 'activate'} ${deactivatePlayer?.full_name}?`}
        confirmLabel={deactivatePlayer?.status === 'active' ? 'Deactivate' : 'Activate'}
        confirmVariant={deactivatePlayer?.status === 'active' ? 'danger' : 'primary'}
        loading={saving}
      />
    </div>
  );
}
