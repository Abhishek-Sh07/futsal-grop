'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Expense, ExpenseCategory, EXPENSE_CATEGORIES } from '@/types';
import { formatNPR, formatDate, cn, getCurrentMonthYear, getMonthOptions } from '@/lib/utils/format';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { Input, Select, TextArea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { toast } from '@/components/ui/Toast';
import { createClient } from '@/lib/supabase/client';
import { Plus, Receipt, Pencil, Trash2, Filter, TrendingDown, ChevronDown } from 'lucide-react';

const CATEGORY_ICONS: Record<ExpenseCategory, string> = {
  ground_booking: '🏟️',
  jersey_kit: '👕',
  tournament_fee: '🏆',
  water_drinks: '💧',
  referee_fee: '🟡',
  medical: '🩺',
  miscellaneous: '📦',
};

const FORM_INIT = {
  title: '',
  category: 'ground_booking' as ExpenseCategory,
  amount: '',
  expense_date: new Date().toISOString().split('T')[0],
  paid_by: '',
  notes: '',
};

interface Props {
  expenses: Expense[];
}

export function ExpensesClient({ expenses }: Props) {
  const router = useRouter();
  const { month: curMonth, year: curYear } = getCurrentMonthYear();
  const [filterMonth, setFilterMonth] = useState(`${curMonth}-${curYear}`);
  const [filterCategory, setFilterCategory] = useState('all');
  const [addOpen, setAddOpen] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [deleteExpense, setDeleteExpense] = useState<Expense | null>(null);
  const [form, setForm] = useState(FORM_INIT);
  const [saving, setSaving] = useState(false);

  const monthOptions = getMonthOptions(12);
  const [fm, fy] = filterMonth.split('-').map(Number);

  const filtered = expenses.filter(e => {
    const d = new Date(e.expense_date);
    const matchMonth = d.getMonth() + 1 === fm && d.getFullYear() === fy;
    const matchCat = filterCategory === 'all' || e.category === filterCategory;
    return matchMonth && matchCat;
  });

  const totalFiltered = filtered.reduce((s, e) => s + e.amount, 0);

  // Category totals
  const catTotals: Partial<Record<ExpenseCategory, number>> = {};
  filtered.forEach(e => {
    catTotals[e.category] = (catTotals[e.category] || 0) + e.amount;
  });

  const openAdd = () => { setForm(FORM_INIT); setAddOpen(true); };
  const openEdit = (e: Expense) => {
    setEditExpense(e);
    setForm({
      title: e.title, category: e.category, amount: String(e.amount),
      expense_date: e.expense_date, paid_by: e.paid_by || '', notes: e.notes || '',
    });
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.amount || Number(form.amount) <= 0) { toast.error('Enter valid amount'); return; }
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const payload = {
      title: form.title.trim(),
      category: form.category,
      amount: Number(form.amount),
      expense_date: form.expense_date,
      paid_by: form.paid_by.trim() || null,
      notes: form.notes.trim() || null,
    };

    if (editExpense) {
      const { error } = await supabase.from('expenses').update({ ...payload, updated_by: user?.id, updated_at: new Date().toISOString() }).eq('id', editExpense.id);
      if (error) { toast.error('Failed to update'); setSaving(false); return; }
      toast.success('Expense updated');
      setEditExpense(null);
    } else {
      const { error } = await supabase.from('expenses').insert({ ...payload, created_by: user?.id });
      if (error) { toast.error('Failed to add expense'); setSaving(false); return; }
      toast.success('Expense added');
      setAddOpen(false);
    }
    setSaving(false);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!deleteExpense) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from('expenses').delete().eq('id', deleteExpense.id);
    if (error) { toast.error('Failed to delete'); }
    else { toast.success('Expense deleted'); }
    setSaving(false);
    setDeleteExpense(null);
    router.refresh();
  };

  const ExpenseForm = () => (
    <div className="space-y-4">
      <Input label="Title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ground booking - May" />
      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Category"
          value={form.category}
          onChange={e => setForm(f => ({ ...f, category: e.target.value as ExpenseCategory }))}
          options={Object.entries(EXPENSE_CATEGORIES).map(([v, l]) => ({ value: v, label: l }))}
        />
        <Input label="Amount (NPR) *" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} type="number" min="0" placeholder="0" />
      </div>
      <Input label="Expense Date" value={form.expense_date} onChange={e => setForm(f => ({ ...f, expense_date: e.target.value }))} type="date" />
      <Input label="Paid By" value={form.paid_by} onChange={e => setForm(f => ({ ...f, paid_by: e.target.value }))} placeholder="Who paid?" />
      <TextArea label="Notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional notes..." rows={2} />
      <div className="flex gap-3 pt-1">
        <Button variant="outline" className="flex-1" onClick={() => { setAddOpen(false); setEditExpense(null); }}>Cancel</Button>
        <Button className="flex-1" loading={saving} onClick={handleSave}>{editExpense ? 'Save Changes' : 'Add Expense'}</Button>
      </div>
    </div>
  );

  return (
    <div className="px-4 pt-4 space-y-4">
      {/* Month filter + Add */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <select
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
            className="w-full h-10 rounded-xl border border-[var(--color-border)] bg-white text-sm px-3 appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
          >
            {monthOptions.map(opt => (
              <option key={`${opt.month}-${opt.year}`} value={`${opt.month}-${opt.year}`}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] pointer-events-none" />
        </div>
        <Button size="md" onClick={openAdd} leftIcon={<Plus size={16} />}>Add</Button>
      </div>

      {/* Total */}
      <div className="bg-[var(--color-primary)] rounded-2xl p-4 text-white flex items-center justify-between">
        <div>
          <p className="text-white/70 text-xs uppercase tracking-wide">Total Expenses</p>
          <p className="text-2xl font-bold number-display mt-0.5">{formatNPR(totalFiltered)}</p>
          <p className="text-white/60 text-xs mt-1">{filtered.length} items</p>
        </div>
        <TrendingDown size={32} className="text-white/30" />
      </div>

      {/* Category breakdown */}
      {Object.keys(catTotals).length > 0 && (
        <div>
          <p className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wide mb-2">By Category</p>
          <div className="grid grid-cols-2 gap-2">
            {(Object.entries(catTotals) as [ExpenseCategory, number][]).map(([cat, amt]) => (
              <div key={cat} className="bg-white rounded-xl border border-[var(--color-border)] p-3">
                <p className="text-base mb-1">{CATEGORY_ICONS[cat]}</p>
                <p className="text-xs text-[var(--color-muted)] truncate">{EXPENSE_CATEGORIES[cat]}</p>
                <p className="text-sm font-bold text-[var(--color-charcoal)] number-display">{formatNPR(amt)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1">
        {[{ value: 'all', label: 'All' }, ...Object.entries(EXPENSE_CATEGORIES).map(([v, l]) => ({ value: v, label: l }))].map(opt => (
          <button
            key={opt.value}
            onClick={() => setFilterCategory(opt.value)}
            className={cn(
              'shrink-0 h-8 px-3 rounded-full text-xs font-semibold transition-all',
              filterCategory === opt.value
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-white border border-[var(--color-border)] text-[var(--color-muted)]'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Expense list */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Receipt size={28} />}
          title="No expenses yet"
          description="Add your first expense for this month"
          action={<Button onClick={openAdd} leftIcon={<Plus size={16} />}>Add Expense</Button>}
        />
      ) : (
        <div className="space-y-2 pb-2">
          {filtered.map(expense => (
            <div key={expense.id} className="bg-white rounded-2xl border border-[var(--color-border)] p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0 text-lg">
                  {CATEGORY_ICONS[expense.category]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[var(--color-charcoal)] truncate">{expense.title}</p>
                  <p className="text-xs text-[var(--color-muted)]">{EXPENSE_CATEGORIES[expense.category]} • {formatDate(expense.expense_date)}</p>
                  {expense.paid_by && <p className="text-xs text-[var(--color-muted)]">Paid by: {expense.paid_by}</p>}
                  {expense.notes && <p className="text-xs text-[var(--color-muted)]/70 mt-0.5 line-clamp-1">{expense.notes}</p>}
                </div>
                <p className="text-base font-bold text-[var(--color-unpaid)] number-display shrink-0">{formatNPR(expense.amount)}</p>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-[var(--color-border)]">
                <button
                  onClick={() => openEdit(expense)}
                  className="flex-1 h-8 rounded-lg border border-[var(--color-border)] text-xs font-semibold text-[var(--color-charcoal)] hover:bg-gray-50 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Pencil size={12} /> Edit
                </button>
                <button
                  onClick={() => setDeleteExpense(expense)}
                  className="flex-1 h-8 rounded-lg border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Expense">
        <ExpenseForm />
      </Modal>
      <Modal open={!!editExpense} onClose={() => setEditExpense(null)} title="Edit Expense">
        <ExpenseForm />
      </Modal>
      <ConfirmModal
        open={!!deleteExpense}
        onClose={() => setDeleteExpense(null)}
        onConfirm={handleDelete}
        title="Delete Expense"
        message={`Delete "${deleteExpense?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        loading={saving}
      />
    </div>
  );
}
