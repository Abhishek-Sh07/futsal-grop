'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Formation, FormationPlayer, MatchType, Player, PlayerRole } from '@/types';
import { cn } from '@/lib/utils/format';
import { toast } from '@/components/ui/Toast';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Save, Share2, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  formation: Formation | null;
  formationPlayers: FormationPlayer[];
  players: Player[];
}

const MAX_STARTERS: Record<MatchType, number> = { '5v5': 5, '7v7': 7 };

const DEFAULT_POSITIONS: Record<MatchType, Array<{ x: number; y: number }>> = {
  '5v5': [
    { x: 50, y: 82 },
    { x: 25, y: 62 },
    { x: 75, y: 62 },
    { x: 50, y: 38 },
    { x: 50, y: 18 },
  ],
  '7v7': [
    { x: 50, y: 85 },
    { x: 20, y: 68 },
    { x: 50, y: 70 },
    { x: 80, y: 68 },
    { x: 30, y: 42 },
    { x: 70, y: 42 },
    { x: 50, y: 18 },
  ],
};

const ROLE_COLORS: Record<PlayerRole, string> = {
  starter: 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]',
  substitute: 'bg-amber-500 text-white border-amber-500',
  unavailable: 'bg-gray-200 text-gray-500 border-gray-200',
};

const ROLE_LABEL: Record<PlayerRole, string> = {
  starter: 'Start',
  substitute: 'Sub',
  unavailable: 'Out',
};

const PITCH_TOKEN_COLORS: Record<PlayerRole, string> = {
  starter: 'bg-white text-[var(--color-primary)] border-[var(--color-primary)]/50',
  substitute: 'bg-amber-400 text-white border-amber-300',
  unavailable: 'bg-gray-400 text-white border-gray-300',
};

export function FormationBuilderClient({ formation, formationPlayers, players }: Props) {
  const router = useRouter();
  const pitchRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState(formation?.name ?? '');
  const [matchType, setMatchType] = useState<MatchType>(formation?.match_type ?? '5v5');
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);

  const [roles, setRoles] = useState<Record<string, PlayerRole>>(() => {
    const init: Record<string, PlayerRole> = {};
    players.forEach(p => { init[p.id] = 'unavailable'; });
    formationPlayers.forEach(fp => { init[fp.player_id] = fp.role; });
    return init;
  });

  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>(() => {
    const init: Record<string, { x: number; y: number }> = {};
    formationPlayers.forEach(fp => {
      if (fp.position_x !== null && fp.position_y !== null) {
        init[fp.player_id] = { x: fp.position_x, y: fp.position_y };
      }
    });
    return init;
  });

  const starterCount = Object.values(roles).filter(r => r === 'starter').length;
  const maxStarters = MAX_STARTERS[matchType];

  const toggleRole = (playerId: string) => {
    const current = roles[playerId];
    const currentStarters = Object.values(roles).filter(r => r === 'starter').length;

    let next: PlayerRole;
    if (current === 'unavailable') {
      next = currentStarters < maxStarters ? 'starter' : 'substitute';
    } else if (current === 'starter') {
      next = 'substitute';
    } else {
      next = 'unavailable';
    }

    setRoles(prev => ({ ...prev, [playerId]: next }));

    if (next === 'starter' && !positions[playerId]) {
      const usedSlots = Object.entries(roles).filter(([_, r]) => r === 'starter').length;
      const defaultPos = DEFAULT_POSITIONS[matchType][usedSlots];
      if (defaultPos) {
        setPositions(prev => ({ ...prev, [playerId]: defaultPos }));
      }
    }
  };

  // Drag on pitch
  const handlePitchPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const tokenEl = (e.target as Element).closest('[data-player-id]');
    if (!tokenEl) return;
    const playerId = tokenEl.getAttribute('data-player-id')!;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(playerId);
  };

  const handlePitchPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging || !pitchRef.current) return;
    const rect = pitchRef.current.getBoundingClientRect();
    const x = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(5, Math.min(95, ((e.clientY - rect.top) / rect.height) * 100));
    setPositions(prev => ({ ...prev, [dragging]: { x, y } }));
  };

  const handlePitchPointerUp = () => setDragging(null);

  const handleMatchTypeChange = (type: MatchType) => {
    setMatchType(type);
    // Reassign starters to default positions for the new type
    const starterIds = Object.entries(roles)
      .filter(([_, r]) => r === 'starter')
      .map(([id]) => id)
      .slice(0, MAX_STARTERS[type]);
    const newPositions: Record<string, { x: number; y: number }> = { ...positions };
    starterIds.forEach((id, i) => {
      newPositions[id] = DEFAULT_POSITIONS[type][i] ?? { x: 50, y: 50 };
    });
    setPositions(newPositions);
    // Cap starters if switching from 7v7 to 5v5
    if (type === '5v5') {
      const excess = Object.entries(roles)
        .filter(([_, r]) => r === 'starter')
        .slice(5);
      if (excess.length) {
        setRoles(prev => {
          const next = { ...prev };
          excess.forEach(([id]) => { next[id] = 'substitute'; });
          return next;
        });
      }
    }
  };

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Enter a lineup name'); return; }
    setSaving(true);
    const supabase = createClient();

    let formationId = formation?.id;

    if (formationId) {
      const { error } = await supabase.from('formations').update({
        name: name.trim(), match_type: matchType, updated_at: new Date().toISOString(),
      }).eq('id', formationId);
      if (error) { toast.error('Failed to save'); setSaving(false); return; }
    } else {
      const { data, error } = await supabase.from('formations')
        .insert({ name: name.trim(), match_type: matchType })
        .select().single();
      if (error || !data) { toast.error('Failed to save'); setSaving(false); return; }
      formationId = data.id;
    }

    await supabase.from('formation_players').delete().eq('formation_id', formationId);

    const fp = players
      .filter(p => roles[p.id] !== 'unavailable')
      .map(p => ({
        formation_id: formationId!,
        player_id: p.id,
        role: roles[p.id],
        position_x: positions[p.id]?.x ?? null,
        position_y: positions[p.id]?.y ?? null,
      }));

    if (fp.length) {
      const { error } = await supabase.from('formation_players').insert(fp);
      if (error) { toast.error('Failed to save players'); setSaving(false); return; }
    }

    toast.success('Lineup saved!');
    setSaving(false);
    router.push('/admin/formations');
    router.refresh();
  };

  const handleShare = () => {
    const starters = players.filter(p => roles[p.id] === 'starter');
    const subs = players.filter(p => roles[p.id] === 'substitute');
    let text = `⚽ *${name || 'Lineup'}* (${matchType === '5v5' ? '5-a-side' : '7-a-side'})\n\n`;
    if (starters.length) {
      text += `*Starting ${maxStarters}:*\n`;
      starters.forEach((p, i) => { text += `${i + 1}. ${p.full_name}\n`; });
    }
    if (subs.length) {
      text += `\n*Substitutes:*\n`;
      subs.forEach(p => { text += `• ${p.full_name}\n`; });
    }
    const unavailable = players.filter(p => roles[p.id] === 'unavailable');
    if (unavailable.length) {
      text += `\n_${unavailable.length} unavailable_`;
    }
    text += `\n\n🔗 futsal-grop.vercel.app`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const starters = players.filter(p => roles[p.id] === 'starter');
  const subs = players.filter(p => roles[p.id] === 'substitute');
  const unavailable = players.filter(p => roles[p.id] === 'unavailable');

  return (
    <div className="flex flex-col h-screen bg-[var(--color-surface-alt)]">
      {/* Header */}
      <div className="bg-white border-b border-[var(--color-border)] px-4 py-3 flex items-center gap-3 shrink-0">
        <button onClick={() => router.push('/admin/formations')} className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--color-muted)] hover:bg-[var(--color-surface-alt)]">
          <ArrowLeft size={20} />
        </button>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Lineup name..."
          className="flex-1 text-base font-semibold text-[var(--color-charcoal)] bg-transparent outline-none placeholder:text-gray-400 placeholder:font-normal"
        />
        <button onClick={handleShare} className="w-8 h-8 flex items-center justify-center rounded-lg text-green-600 hover:bg-green-50">
          <Share2 size={18} />
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[var(--color-primary)] text-white text-sm font-semibold disabled:opacity-60"
        >
          <Save size={14} />
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      {/* Match type toggle */}
      <div className="bg-white px-4 py-2.5 flex items-center gap-3 border-b border-[var(--color-border)] shrink-0">
        <span className="text-xs font-semibold text-[var(--color-muted)]">FORMAT</span>
        <div className="flex bg-[var(--color-surface-alt)] rounded-lg p-0.5">
          {(['5v5', '7v7'] as MatchType[]).map(type => (
            <button
              key={type}
              onClick={() => handleMatchTypeChange(type)}
              className={cn(
                'px-4 py-1 rounded-md text-sm font-semibold transition-all',
                matchType === type
                  ? 'bg-[var(--color-primary)] text-white shadow-sm'
                  : 'text-[var(--color-muted)]'
              )}
            >
              {type}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-[var(--color-muted)]">
          {starterCount}/{maxStarters} starters
        </span>
      </div>

      {/* Pitch */}
      <div className="flex-1 flex items-center justify-center p-3 min-h-0">
        <div
          ref={pitchRef}
          className="relative w-full bg-emerald-700 rounded-2xl overflow-hidden shadow-xl border border-emerald-600 select-none"
          style={{ aspectRatio: '2/3', maxHeight: '100%', maxWidth: 'calc(100vh * 2/3 - 80px)', touchAction: 'none' }}
          onPointerDown={handlePitchPointerDown}
          onPointerMove={handlePitchPointerMove}
          onPointerUp={handlePitchPointerUp}
          onPointerCancel={handlePitchPointerUp}
        >
          {/* Pitch markings */}
          <div className="absolute inset-[6%] border-2 border-white/40 rounded-sm pointer-events-none" />
          <div className="absolute left-[6%] right-[6%] top-1/2 h-px bg-white/40 pointer-events-none" />
          {/* Center circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/40 pointer-events-none"
            style={{ width: '28%', aspectRatio: '1' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/50 pointer-events-none" />
          {/* Top goal area */}
          <div className="absolute top-[6%] left-1/2 -translate-x-1/2 border-2 border-white/40 pointer-events-none"
            style={{ width: '44%', height: '14%' }} />
          {/* Bottom goal area */}
          <div className="absolute bottom-[6%] left-1/2 -translate-x-1/2 border-2 border-white/40 pointer-events-none"
            style={{ width: '44%', height: '14%' }} />
          {/* Top penalty spot */}
          <div className="absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white/50 pointer-events-none"
            style={{ top: '20%' }} />
          {/* Bottom penalty spot */}
          <div className="absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white/50 pointer-events-none"
            style={{ bottom: '20%' }} />

          {/* Attack / Defend labels */}
          <div className="absolute top-2 left-0 right-0 flex justify-center pointer-events-none">
            <span className="text-white/30 text-[10px] font-semibold tracking-widest uppercase">Attack</span>
          </div>
          <div className="absolute bottom-2 left-0 right-0 flex justify-center pointer-events-none">
            <span className="text-white/30 text-[10px] font-semibold tracking-widest uppercase">Defend</span>
          </div>

          {/* Player tokens on pitch */}
          {starters.map(player => {
            const pos = positions[player.id];
            if (!pos) return null;
            const isDragging = dragging === player.id;
            return (
              <div
                key={player.id}
                data-player-id={player.id}
                className="absolute flex flex-col items-center"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: isDragging ? 10 : 1,
                  cursor: isDragging ? 'grabbing' : 'grab',
                }}
              >
                <div className={cn(
                  'w-9 h-9 rounded-full border-2 flex items-center justify-center shadow-lg font-bold text-sm transition-transform',
                  PITCH_TOKEN_COLORS['starter'],
                  isDragging && 'scale-110'
                )}>
                  {player.full_name.charAt(0).toUpperCase()}
                </div>
                <span className="text-white text-[9px] font-semibold mt-0.5 leading-none max-w-[48px] text-center truncate drop-shadow">
                  {player.full_name.split(' ')[0]}
                </span>
              </div>
            );
          })}

          {/* Sub tokens (bottom strip) */}
          {subs.length > 0 && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/30 backdrop-blur-sm flex items-center justify-center gap-3 py-1.5 pointer-events-none">
              {subs.map(player => (
                <div key={player.id} className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-amber-400 border-2 border-amber-300 flex items-center justify-center text-xs font-bold text-white shadow">
                    {player.full_name.charAt(0)}
                  </div>
                  <span className="text-white text-[8px] leading-none mt-0.5 max-w-[36px] text-center truncate">
                    {player.full_name.split(' ')[0]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Player panel */}
      <div className="bg-white border-t border-[var(--color-border)] shrink-0" style={{ maxHeight: '45vh' }}>
        <button
          onClick={() => setPanelOpen(o => !o)}
          className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-[var(--color-charcoal)]"
        >
          <span>Players — tap to cycle role</span>
          {panelOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>

        {panelOpen && (
          <div className="overflow-y-auto px-4 pb-4" style={{ maxHeight: 'calc(45vh - 44px)' }}>
            {/* Starters section */}
            {starters.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-[var(--color-primary)] mb-1.5">
                  Starters ({starters.length}/{maxStarters})
                </p>
                <div className="space-y-1.5">
                  {starters.map(p => <PlayerRow key={p.id} player={p} role="starter" onToggle={toggleRole} />)}
                </div>
              </div>
            )}

            {/* Subs section */}
            {subs.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-amber-600 mb-1.5">Substitutes ({subs.length})</p>
                <div className="space-y-1.5">
                  {subs.map(p => <PlayerRow key={p.id} player={p} role="substitute" onToggle={toggleRole} />)}
                </div>
              </div>
            )}

            {/* Unavailable */}
            {unavailable.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-[var(--color-muted)] mb-1.5">
                  Unavailable ({unavailable.length})
                </p>
                <div className="space-y-1.5">
                  {unavailable.map(p => <PlayerRow key={p.id} player={p} role="unavailable" onToggle={toggleRole} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PlayerRow({ player, role, onToggle }: {
  player: Player;
  role: PlayerRole;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-2.5 py-1">
      <div className="w-8 h-8 rounded-xl bg-[var(--color-surface-alt)] flex items-center justify-center shrink-0">
        <span className="text-xs font-bold text-[var(--color-charcoal)]">{player.full_name.charAt(0)}</span>
      </div>
      <span className="flex-1 text-sm font-medium text-[var(--color-charcoal)] truncate">{player.full_name}</span>
      {player.phone && (
        <span className="text-xs text-[var(--color-muted)] hidden sm:block">{player.phone}</span>
      )}
      <button
        onClick={() => onToggle(player.id)}
        className={cn(
          'shrink-0 h-7 px-3 rounded-full text-xs font-semibold border transition-all',
          ROLE_COLORS[role]
        )}
      >
        {ROLE_LABEL[role]}
      </button>
    </div>
  );
}
