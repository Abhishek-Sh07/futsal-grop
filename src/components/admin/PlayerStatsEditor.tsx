'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlayerStats, PlayerContribution } from '@/types';
import { toast } from '@/components/ui/Toast';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils/format';

interface Props {
  playerId: string;
  stats: PlayerStats;
  contribution: PlayerContribution;
}

type Tab = 'performance' | 'discipline' | 'attendance' | 'contribution';

export function PlayerStatsEditor({ playerId, stats: initialStats, contribution: initialContrib }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('performance');
  const [saving, setSaving] = useState(false);

  const [stats, setStats] = useState({
    matches_played: initialStats.matches_played,
    goals: initialStats.goals,
    assists: initialStats.assists,
    wins: initialStats.wins,
    losses: initialStats.losses,
    draws: initialStats.draws,
    mvp_count: initialStats.mvp_count,
    yellow_cards: initialStats.yellow_cards,
    red_cards: initialStats.red_cards,
    attendance_percentage: initialStats.attendance_percentage,
    clean_sheets: initialStats.clean_sheets,
    saves: initialStats.saves,
    goals_conceded: initialStats.goals_conceded,
    late_cancellations: initialStats.late_cancellations,
    no_shows: initialStats.no_shows,
    is_goalkeeper: initialStats.is_goalkeeper,
  });

  const [contrib, setContrib] = useState({
    availability_response_points: initialContrib.availability_response_points,
    assigned_position_points: initialContrib.assigned_position_points,
    versatility_points: initialContrib.versatility_points,
    substitute_points: initialContrib.substitute_points,
    organization_points: initialContrib.organization_points,
    captain_points: initialContrib.captain_points,
  });

  const setS = (key: keyof typeof stats, val: number | boolean) =>
    setStats(prev => ({ ...prev, [key]: val }));
  const setC = (key: keyof typeof contrib, val: number) =>
    setContrib(prev => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    const [r1, r2] = await Promise.all([
      supabase.from('player_stats').update({ ...stats, updated_at: new Date().toISOString() }).eq('player_id', playerId),
      supabase.from('player_contribution').update({ ...contrib, updated_at: new Date().toISOString() }).eq('player_id', playerId),
    ]);
    if (r1.error || r2.error) { toast.error('Failed to save stats'); }
    else { toast.success('Stats saved — rating updated!'); router.refresh(); }
    setSaving(false);
  };

  const TABS: Array<{ key: Tab; label: string }> = [
    { key: 'performance', label: 'Performance' },
    { key: 'discipline', label: 'Discipline' },
    { key: 'attendance', label: 'Attendance' },
    { key: 'contribution', label: 'Contribution' },
  ];

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 bg-[var(--color-surface-alt)] p-1 rounded-xl overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex-1 shrink-0 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap',
              tab === t.key ? 'bg-white text-[var(--color-primary)] shadow-sm' : 'text-[var(--color-muted)]'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* GK toggle (always visible) */}
      <label className="flex items-center justify-between p-3 bg-[var(--color-surface-alt)] rounded-xl cursor-pointer">
        <span className="text-sm font-semibold text-[var(--color-charcoal)]">Goalkeeper</span>
        <div className={cn('w-11 h-6 rounded-full transition-colors relative', stats.is_goalkeeper ? 'bg-[var(--color-primary)]' : 'bg-gray-300')}
          onClick={() => setS('is_goalkeeper', !stats.is_goalkeeper)}>
          <div className={cn('absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform', stats.is_goalkeeper ? 'translate-x-5' : 'translate-x-0.5')} />
        </div>
      </label>

      {/* Performance */}
      {tab === 'performance' && (
        <div className="space-y-3">
          <NumField label="Matches Played" value={stats.matches_played} onChange={v => setS('matches_played', v)} />
          <NumField label="Wins" value={stats.wins} onChange={v => setS('wins', v)} hint="+2 pts each" />
          <NumField label="Losses" value={stats.losses} onChange={v => setS('losses', v)} hint="-1 pt each" />
          <NumField label="Draws" value={stats.draws} onChange={v => setS('draws', v)} />
          <NumField label="MVP Awards" value={stats.mvp_count} onChange={v => setS('mvp_count', v)} hint="+5 pts each" />
          {stats.is_goalkeeper ? (
            <>
              <NumField label="Clean Sheets" value={stats.clean_sheets} onChange={v => setS('clean_sheets', v)} hint="+5 pts each" />
              <NumField label="Saves" value={stats.saves} onChange={v => setS('saves', v)} hint="+1 pt each" />
              <NumField label="Goals Conceded" value={stats.goals_conceded} onChange={v => setS('goals_conceded', v)} hint="-1 pt each" />
            </>
          ) : (
            <>
              <NumField label="Goals" value={stats.goals} onChange={v => setS('goals', v)} hint="+4 pts each" />
              <NumField label="Assists" value={stats.assists} onChange={v => setS('assists', v)} hint="+3 pts each" />
            </>
          )}
        </div>
      )}

      {/* Discipline */}
      {tab === 'discipline' && (
        <div className="space-y-3">
          <div className="p-3 bg-amber-50 rounded-xl text-xs text-amber-700 font-medium">
            Discipline starts at 10. Deductions apply for cards, no-shows, and late cancellations.
          </div>
          <NumField label="Yellow Cards" value={stats.yellow_cards} onChange={v => setS('yellow_cards', v)} hint="-1 pt each" />
          <NumField label="Red Cards" value={stats.red_cards} onChange={v => setS('red_cards', v)} hint="-3 pts each" />
          <NumField label="Late Cancellations" value={stats.late_cancellations} onChange={v => setS('late_cancellations', v)} hint="-2 pts each" />
          <NumField label="No-Shows" value={stats.no_shows} onChange={v => setS('no_shows', v)} hint="-3 pts each" />
        </div>
      )}

      {/* Attendance */}
      {tab === 'attendance' && (
        <div className="space-y-3">
          <div className="p-3 bg-blue-50 rounded-xl text-xs text-blue-700 font-medium">
            Attendance % determines the Attendance Score (max 20 pts). 100% = 20 pts, 80% = 16 pts.
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--color-charcoal)] mb-1.5">
              Attendance % <span className="font-normal text-[var(--color-muted)]">(0–100)</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range" min={0} max={100} step={1}
                value={stats.attendance_percentage}
                onChange={e => setS('attendance_percentage', Number(e.target.value))}
                className="flex-1 accent-[var(--color-primary)]"
              />
              <span className="text-lg font-black text-[var(--color-primary)] w-14 text-right">
                {stats.attendance_percentage}%
              </span>
            </div>
            <p className="text-xs text-[var(--color-muted)] mt-1">
              Attendance Score: {((stats.attendance_percentage / 100) * 20).toFixed(1)} / 20
            </p>
          </div>
        </div>
      )}

      {/* Contribution */}
      {tab === 'contribution' && (
        <div className="space-y-3">
          <div className="p-3 bg-purple-50 rounded-xl text-xs text-purple-700 font-medium">
            Contribution measures team responsibility. Max 20 pts total.
          </div>
          <ContribField label="Marks availability on time" value={contrib.availability_response_points} max={4} onChange={v => setC('availability_response_points', v)} />
          <ContribField label="Plays assigned position" value={contrib.assigned_position_points} max={4} onChange={v => setC('assigned_position_points', v)} />
          <ContribField label="Can play multiple positions" value={contrib.versatility_points} max={4} onChange={v => setC('versatility_points', v)} />
          <ContribField label="Accepts substitute role" value={contrib.substitute_points} max={3} onChange={v => setC('substitute_points', v)} />
          <ContribField label="Helps team organization" value={contrib.organization_points} max={3} onChange={v => setC('organization_points', v)} />
          <ContribField label="Captain / admin contribution" value={contrib.captain_points} max={2} onChange={v => setC('captain_points', v)} />
          <div className="flex justify-between text-sm font-bold pt-1 border-t border-[var(--color-border)]">
            <span className="text-[var(--color-charcoal)]">Total</span>
            <span className="text-[var(--color-primary)]">
              {Math.min(20, Object.values(contrib).reduce((a, b) => a + b, 0))} / 20
            </span>
          </div>
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full h-12 rounded-xl bg-[var(--color-primary)] text-white font-semibold text-sm disabled:opacity-60 transition-all"
      >
        {saving ? 'Saving…' : 'Save & Recalculate Rating'}
      </button>
    </div>
  );
}

function NumField({ label, value, onChange, hint }: {
  label: string; value: number; onChange: (v: number) => void; hint?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <p className="text-sm font-semibold text-[var(--color-charcoal)]">{label}</p>
        {hint && <p className="text-xs text-[var(--color-muted)]">{hint}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button onClick={() => onChange(Math.max(0, value - 1))}
          className="w-8 h-8 rounded-lg bg-[var(--color-surface-alt)] text-[var(--color-charcoal)] font-bold text-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
          −
        </button>
        <span className="w-8 text-center text-sm font-black text-[var(--color-charcoal)]">{value}</span>
        <button onClick={() => onChange(value + 1)}
          className="w-8 h-8 rounded-lg bg-[var(--color-primary)] text-white font-bold text-lg flex items-center justify-center hover:opacity-90 transition-colors">
          +
        </button>
      </div>
    </div>
  );
}

function ContribField({ label, value, max, onChange }: {
  label: string; value: number; max: number; onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="font-medium text-[var(--color-charcoal)]">{label}</span>
        <span className="font-bold text-[var(--color-primary)]">{value} / {max}</span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: max }, (_, i) => (
          <button
            key={i}
            onClick={() => onChange(i + 1 === value ? 0 : i + 1)}
            className={cn(
              'flex-1 h-6 rounded-md transition-all',
              i < value ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-surface-alt)]'
            )}
          />
        ))}
      </div>
    </div>
  );
}
