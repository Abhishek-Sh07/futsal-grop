'use client';

import { useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { Share2, Download } from 'lucide-react';
import { Player, PlayerProfile, TeamSettings, RatingBreakdown } from '@/types';

const DEFAULT_TEAM: TeamSettings = {
  id: '',
  team_name: 'Futsal Team',
  logo_url: null,
  primary_color: '#D71920',
  secondary_color: '#07111F',
  accent_color: '#FF3B30',
  created_at: '',
  updated_at: '',
};

interface DynamicPlayerCardProps {
  player: Player;
  profile?: PlayerProfile | null;
  team?: TeamSettings | null;
  rating: RatingBreakdown;
  stats: {
    matches: number;
    goals: number;
    assists: number;
    attendance: number;
    isGoalkeeper: boolean;
    cleanSheets: number;
    saves: number;
  };
  variant?: 'full' | 'compact' | 'shareable' | 'chip';
  showActions?: boolean;
}

function Stars({ rating, color }: { rating: number; color: string }) {
  const filled = Math.round((rating / 99) * 5);
  return (
    <div className="flex gap-0.5 justify-center mt-1">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="10" height="10" viewBox="0 0 24 24">
          <polygon
            points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
            fill={i <= filled ? color : 'transparent'}
            stroke={color}
            strokeWidth="2"
          />
        </svg>
      ))}
    </div>
  );
}

export function DynamicPlayerCard({
  player,
  profile,
  team,
  rating,
  stats,
  variant = 'full',
  showActions = false,
}: DynamicPlayerCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const t = team ?? DEFAULT_TEAM;

  const displayName = profile?.nickname || player.full_name;
  const nameParts = displayName.trim().split(' ');
  const firstName = nameParts.slice(0, -1).join(' ') || displayName;
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
  const position = profile?.preferred_position || (stats.isGoalkeeper ? 'GK' : 'FW');
  const jerseyNum = (profile?.jersey_number || '?').padStart(2, '0');
  const foot = profile?.strong_foot || 'Right';

  const statsRow = stats.isGoalkeeper
    ? [
        { label: 'MATCHES', value: stats.matches },
        { label: 'SAVES', value: stats.saves },
        { label: 'CLEAN', value: stats.cleanSheets },
        { label: 'ATT%', value: `${stats.attendance}%` },
      ]
    : [
        { label: 'MATCHES', value: stats.matches },
        { label: 'GOALS', value: stats.goals },
        { label: 'ASSISTS', value: stats.assists },
        { label: 'ATT%', value: `${stats.attendance}%` },
      ];

  const handleExport = useCallback(async () => {
    if (!cardRef.current) return;
    setExporting(true);
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 3 });
      const link = document.createElement('a');
      link.download = `${player.full_name.replace(/\s+/g, '_')}_card.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setExporting(false);
    }
  }, [player.full_name]);

  const handleShare = useCallback(async () => {
    const text = `⚽ ${player.full_name} | ${t.team_name}\n🎯 Rating: ${rating.isNewPlayer ? 'New' : rating.finalRating} (${rating.ratingLabel})\n📊 Matches: ${stats.matches} | Goals: ${stats.goals} | Assists: ${stats.assists}\n✅ Attendance: ${stats.attendance}%`;
    if (navigator.share) {
      try { await navigator.share({ text }); } catch { /* cancelled */ }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
  }, [player.full_name, t.team_name, rating, stats]);

  // ── Chip variant ──────────────────────────────────────────────
  if (variant === 'chip') {
    return (
      <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: t.secondary_color }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black text-white shrink-0" style={{ background: t.primary_color }}>
          {jerseyNum}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-white truncate">{displayName}</p>
          <p className="text-[10px]" style={{ color: t.accent_color }}>{position}</p>
        </div>
        {!rating.isNewPlayer && <span className="text-sm font-black text-white">{rating.finalRating}</span>}
      </div>
    );
  }

  // ── Compact variant ───────────────────────────────────────────
  if (variant === 'compact') {
    return (
      <div className="rounded-2xl overflow-hidden relative" style={{ background: `linear-gradient(135deg, ${t.secondary_color} 0%, #0d1d2e 100%)` }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(ellipse at 70% 50%, ${t.primary_color} 0%, transparent 70%)` }} />
        <div className="relative p-4 flex items-center gap-4">
          <div className="relative shrink-0 w-16 h-16 rounded-2xl overflow-hidden" style={{ background: `linear-gradient(135deg, ${t.primary_color}, ${t.accent_color})` }}>
            {profile?.photo_url ? (
              <Image src={profile.photo_url} alt={player.full_name} fill className="object-cover object-top" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-black text-white">{player.full_name.charAt(0)}</div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-black text-sm leading-tight truncate">{firstName}</p>
            {lastName && <p className="font-black text-sm leading-tight truncate" style={{ color: t.accent_color }}>{lastName}</p>}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${t.primary_color}33`, color: t.accent_color }}>{position}</span>
              <span className="text-[10px] text-white/60">{foot} foot</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            {rating.isNewPlayer ? (
              <span className="text-[10px] text-white/50">NEW</span>
            ) : (
              <>
                <p className="text-3xl font-black text-white leading-none">{rating.finalRating}</p>
                <p className="text-[10px] font-bold" style={{ color: t.accent_color }}>{rating.ratingLabel}</p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Full / Shareable variant ──────────────────────────────────
  return (
    <div className="space-y-3">
      <div
        ref={cardRef}
        className="relative overflow-hidden rounded-3xl select-none"
        style={{
          aspectRatio: '3/4',
          background: t.secondary_color,
          boxShadow: `0 0 0 2px ${t.primary_color}66, 0 0 40px ${t.primary_color}33, 0 20px 60px rgba(0,0,0,0.8)`,
        }}
      >
        {/* ── Full-bleed player photo ── */}
        {profile?.photo_url ? (
          <div className="absolute inset-0">
            <Image
              src={profile.photo_url}
              alt={player.full_name}
              fill
              className="object-cover object-top"
              priority
            />
          </div>
        ) : (
          /* No photo: gradient bg with logo watermark */
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: `linear-gradient(160deg, ${t.secondary_color} 0%, #0a1520 100%)` }}
          >
            <Image
              src={t.logo_url || '/logo.png'}
              alt=""
              width={220}
              height={220}
              className="object-contain opacity-10"
              style={{ mixBlendMode: 'screen' }}
            />
          </div>
        )}

        {/* ── Top dark vignette ── */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 35%, rgba(0,0,0,0.0) 55%, rgba(0,0,0,0.75) 75%, rgba(0,0,0,0.95) 100%)' }}
        />

        {/* ── Red diagonal light sweep ── */}
        <div
          className="absolute inset-0 opacity-20"
          style={{ background: `linear-gradient(135deg, transparent 30%, ${t.primary_color} 60%, transparent 80%)` }}
        />


        {/* ── Red card border glow (inner) ── */}
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{ boxShadow: `inset 0 0 0 1.5px ${t.primary_color}88` }}
        />

        {/* ── TOP ROW: Jersey # (left) + Rating box (right) ── */}
        <div className="absolute top-5 left-5 right-5 flex items-start justify-between z-10">
          {/* Jersey number */}
          <div>
            <p
              className="font-black leading-none tracking-tighter"
              style={{
                fontSize: '4.5rem',
                color: 'white',
                textShadow: `0 0 30px ${t.primary_color}, 2px 2px 0px rgba(0,0,0,0.8)`,
                letterSpacing: '-2px',
              }}
            >
              {jerseyNum}
            </p>
            {/* Red line under jersey number */}
            <div className="h-0.5 w-10 mt-1 rounded-full" style={{ background: t.primary_color }} />
          </div>

          {/* Rating box */}
          <div
            className="flex flex-col items-center px-4 py-2.5 rounded-xl"
            style={{
              background: 'rgba(0,0,0,0.6)',
              border: `1.5px solid ${t.primary_color}88`,
              backdropFilter: 'blur(8px)',
              minWidth: 72,
            }}
          >
            <p className="text-[10px] font-black tracking-widest" style={{ color: t.accent_color }}>RATING</p>
            {rating.isNewPlayer ? (
              <p className="text-sm font-black text-white/50 mt-1">NEW</p>
            ) : (
              <p className="text-4xl font-black text-white leading-none mt-0.5">{rating.finalRating}</p>
            )}
            <Stars rating={rating.isNewPlayer ? 0 : rating.finalRating} color={t.accent_color} />
          </div>
        </div>

        {/* ── LEFT SIDE: Position + Strong Foot ── */}
        <div className="absolute left-5 z-10" style={{ top: '38%' }}>
          <div className="flex flex-col gap-3">
            {/* Position */}
            <div>
              <p className="text-[9px] font-black tracking-widest text-white/60 mb-1">POSITION</p>
              <div
                className="px-3 py-1.5 rounded-lg"
                style={{
                  background: 'rgba(0,0,0,0.55)',
                  border: `1.5px solid ${t.primary_color}`,
                  backdropFilter: 'blur(4px)',
                }}
              >
                <p className="text-sm font-black text-white tracking-wider">{position}</p>
              </div>
            </div>

            {/* Strong foot */}
            <div>
              <p className="text-[9px] font-black tracking-widest text-white/60 mb-1">STRONG FOOT</p>
              <div className="flex items-center gap-1.5">
                {/* Football boot icon */}
                <svg width="22" height="22" viewBox="0 0 100 100" fill="white" opacity="0.9">
                  {/* Shaft */}
                  <rect x="18" y="8" width="22" height="48" rx="8"/>
                  {/* Foot bed */}
                  <path d="M18 50 Q18 68 28 68 L78 68 Q88 68 88 58 L88 54 Q88 44 78 44 L40 44 L40 50 Z"/>
                  {/* Studs */}
                  <rect x="26" y="68" width="9" height="7" rx="3"/>
                  <rect x="42" y="68" width="9" height="7" rx="3"/>
                  <rect x="58" y="68" width="9" height="7" rx="3"/>
                  <rect x="72" y="68" width="9" height="7" rx="3"/>
                </svg>
                <p className="text-sm font-bold text-white">{foot} Foot</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── BOTTOM SECTION ── */}
        <div className="absolute bottom-0 left-0 right-0 z-10 px-5 pb-4">
          {/* Player name */}
          <div className="mb-2">
            <p
              className="font-black uppercase leading-tight tracking-wide"
              style={{ fontSize: '1.75rem', color: 'white', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}
            >
              {firstName}
            </p>
            {lastName && (
              <p
                className="font-black uppercase leading-none tracking-wide"
                style={{ fontSize: '2.4rem', color: t.accent_color, textShadow: `0 0 20px ${t.primary_color}88, 0 2px 8px rgba(0,0,0,0.8)` }}
              >
                {lastName}
              </p>
            )}
          </div>

          {/* Team name with lines */}
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${t.accent_color}88)` }} />
            <p className="text-[9px] font-black tracking-[0.2em] text-white/70 uppercase">{t.team_name}</p>
            <div className="h-px flex-1" style={{ background: `linear-gradient(to left, transparent, ${t.accent_color}88)` }} />
          </div>

          {/* Stats row */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="grid divide-x" style={{ gridTemplateColumns: `repeat(${statsRow.length}, 1fr)`, borderColor: 'rgba(255,255,255,0.08)' }}>
              {statsRow.map((s, i) => (
                <div key={i} className="flex flex-col items-center py-3 gap-1">
                  <p className="text-[9px] font-black tracking-widest" style={{ color: t.accent_color }}>{s.label}</p>
                  <p className="text-xl font-black text-white leading-none">{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      {showActions && (
        <div className="flex gap-2">
          <button
            onClick={handleShare}
            className="flex-1 h-11 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-white transition-opacity active:opacity-70"
            style={{ background: `linear-gradient(135deg, ${t.primary_color}, ${t.accent_color})` }}
          >
            <Share2 size={16} /> Share
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex-1 h-11 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-white transition-opacity active:opacity-70 disabled:opacity-50"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <Download size={16} /> {exporting ? 'Saving…' : 'Save PNG'}
          </button>
        </div>
      )}
    </div>
  );
}
