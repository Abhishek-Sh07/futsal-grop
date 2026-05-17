'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Profile } from '@/types';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { createClient } from '@/lib/supabase/client';
import { LogOut, User, Shield } from 'lucide-react';

interface Props { profile: Profile | null; }

export function SettingsClient({ profile }: Props) {
  const router = useRouter();
  const [name, setName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from('profiles')
      .update({ full_name: name.trim(), phone: phone.trim() || null, updated_at: new Date().toISOString() })
      .eq('id', profile!.id);
    if (error) toast.error('Failed to save');
    else toast.success('Profile updated');
    setSaving(false);
    router.refresh();
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="px-4 pt-4 space-y-5">
      {/* Profile */}
      <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center">
            <User size={22} className="text-[var(--color-primary)]" />
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--color-charcoal)]">{profile?.full_name}</p>
            <p className="text-xs text-[var(--color-muted)]">{profile?.email}</p>
            <span className="inline-flex items-center gap-1 text-xs text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2 py-0.5 rounded-full mt-0.5">
              <Shield size={10} /> Admin
            </span>
          </div>
        </div>
        <div className="space-y-3">
          <Input label="Full Name" value={name} onChange={e => setName(e.target.value)} />
          <Input label="Phone" value={phone} onChange={e => setPhone(e.target.value)} type="tel" placeholder="98XXXXXXXX" />
        </div>
        <Button className="w-full mt-4" loading={saving} onClick={handleSave}>Save Changes</Button>
      </div>

      {/* App info */}
      <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5">
        <h3 className="text-sm font-bold text-[var(--color-charcoal)] mb-3">About</h3>
        <div className="space-y-2 text-sm text-[var(--color-muted)]">
          <div className="flex justify-between"><span>App</span><span className="font-medium text-[var(--color-charcoal)]">Futsal Hisab</span></div>
          <div className="flex justify-between"><span>Version</span><span className="font-medium text-[var(--color-charcoal)]">1.0.0</span></div>
          <div className="flex justify-between"><span>Role</span><span className="font-medium text-[var(--color-charcoal)] capitalize">{profile?.role}</span></div>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full h-12 rounded-2xl border border-red-200 text-red-600 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-red-50 transition-colors"
      >
        <LogOut size={16} /> Sign Out
      </button>
    </div>
  );
}
