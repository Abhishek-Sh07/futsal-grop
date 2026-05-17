'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Camera, Save, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { PlayerProfile } from '@/types';
import { toast } from '@/components/ui/Toast';

const POSITIONS = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST', 'CF'];
const PLAYING_STYLES = ['Aggressive', 'Possession', 'Counter-attack', 'Pressing', 'Technical', 'Physical'];

interface Props {
  playerId: string;
  profile: PlayerProfile | null;
  onUpdate?: (updated: PlayerProfile) => void;
}

export function PlayerProfileEditor({ playerId, profile, onUpdate }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(profile?.photo_url ?? '');
  const [form, setForm] = useState({
    nickname: profile?.nickname ?? '',
    jersey_number: profile?.jersey_number ?? '',
    preferred_position: profile?.preferred_position ?? '',
    secondary_position: profile?.secondary_position ?? '',
    strong_foot: (profile?.strong_foot ?? 'Right') as 'Right' | 'Left' | 'Both',
    playing_style: profile?.playing_style ?? '',
  });

  const handlePhoto = async (file: File) => {
    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split('.').pop();
    const path = `${playerId}/photo.${ext}`;
    const { error } = await supabase.storage.from('player-photos').upload(path, file, { upsert: true });
    if (error) {
      toast.error('Photo upload failed');
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from('player-photos').getPublicUrl(path);
    const url = `${data.publicUrl}?t=${Date.now()}`;
    setPhotoUrl(url);
    await supabase.from('player_profiles').update({ photo_url: url }).eq('player_id', playerId);
    setUploading(false);
    toast.success('Photo updated');
  };

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from('player_profiles')
      .update({ ...form, photo_url: photoUrl || null })
      .eq('player_id', playerId)
      .select()
      .single();
    setSaving(false);
    if (error) { toast.error('Save failed'); return; }
    toast.success('Profile saved');
    if (onUpdate && data) onUpdate(data as PlayerProfile);
  };

  return (
    <div className="space-y-5">
      {/* Photo upload */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={() => fileRef.current?.click()}
          className="relative w-24 h-24 rounded-2xl overflow-hidden group"
          style={{ background: 'linear-gradient(135deg, #D71920, #FF3B30)' }}
        >
          {photoUrl ? (
            <Image src={photoUrl} alt="Player photo" fill className="object-cover" />
          ) : (
            <span className="text-3xl font-black text-white/30">?</span>
          )}
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            {uploading ? <Loader2 size={20} className="text-white animate-spin" /> : <Camera size={20} className="text-white" />}
          </div>
        </button>
        <p className="text-xs text-[var(--color-muted)]">Tap to change photo</p>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => e.target.files?.[0] && handlePhoto(e.target.files[0])}
        />
      </div>

      {/* Fields */}
      <div className="space-y-3">
        <div>
          <label className="text-xs font-semibold text-[var(--color-muted)] mb-1 block">Nickname</label>
          <input
            className="w-full h-10 rounded-xl border border-[var(--color-border)] px-3 text-sm text-[var(--color-charcoal)] bg-[var(--color-surface-alt)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
            placeholder="Display name on card"
            value={form.nickname}
            onChange={e => setForm(f => ({ ...f, nickname: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-[var(--color-muted)] mb-1 block">Jersey #</label>
            <input
              className="w-full h-10 rounded-xl border border-[var(--color-border)] px-3 text-sm text-[var(--color-charcoal)] bg-[var(--color-surface-alt)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
              placeholder="e.g. 10"
              value={form.jersey_number}
              onChange={e => setForm(f => ({ ...f, jersey_number: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--color-muted)] mb-1 block">Strong Foot</label>
            <select
              className="w-full h-10 rounded-xl border border-[var(--color-border)] px-3 text-sm text-[var(--color-charcoal)] bg-[var(--color-surface-alt)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
              value={form.strong_foot}
              onChange={e => setForm(f => ({ ...f, strong_foot: e.target.value as 'Right' | 'Left' | 'Both' }))}
            >
              <option>Right</option>
              <option>Left</option>
              <option>Both</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-[var(--color-muted)] mb-1 block">Primary Position</label>
            <select
              className="w-full h-10 rounded-xl border border-[var(--color-border)] px-3 text-sm text-[var(--color-charcoal)] bg-[var(--color-surface-alt)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
              value={form.preferred_position}
              onChange={e => setForm(f => ({ ...f, preferred_position: e.target.value }))}
            >
              <option value="">Select</option>
              {POSITIONS.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--color-muted)] mb-1 block">Secondary Position</label>
            <select
              className="w-full h-10 rounded-xl border border-[var(--color-border)] px-3 text-sm text-[var(--color-charcoal)] bg-[var(--color-surface-alt)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
              value={form.secondary_position}
              onChange={e => setForm(f => ({ ...f, secondary_position: e.target.value }))}
            >
              <option value="">None</option>
              {POSITIONS.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-[var(--color-muted)] mb-1 block">Playing Style</label>
          <select
            className="w-full h-10 rounded-xl border border-[var(--color-border)] px-3 text-sm text-[var(--color-charcoal)] bg-[var(--color-surface-alt)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
            value={form.playing_style}
            onChange={e => setForm(f => ({ ...f, playing_style: e.target.value }))}
          >
            <option value="">Select</option>
            {PLAYING_STYLES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full h-11 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-white disabled:opacity-60 transition-opacity"
        style={{ background: 'linear-gradient(135deg, #D71920, #FF3B30)' }}
      >
        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        {saving ? 'Saving…' : 'Save Profile'}
      </button>
    </div>
  );
}
