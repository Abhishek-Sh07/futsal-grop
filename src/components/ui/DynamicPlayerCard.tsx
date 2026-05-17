'use client';

import { useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { Share2, Download, Star } from 'lucide-react';
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

function StarRating({ rating, color }: { rating: number; color: string }) {
  const stars = Math.round((rating / 99) * 5);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={8}
          fill={i <= stars ? color : 'transparent'}
          stroke={color}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

function StatBox({ label, value, accent }: { label: string; value: string | number; accent: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[10px] font-black tracking-widest" style={{ color: accent }}>{label}</span>
      <span className="text-base font-black text-white leading-none">{value}</span>
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
  const jerseyNum = profile?.jersey_number || '?';
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

  if (variant === 'chip') {
    return (
      <div
        className="flex items-center gap-2 rounded-xl px-3 py-2"
        style={{ background: t.secondary_color }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black text-white shrink-0"
          style={{ background: t.primary_color }}
        >
          {jerseyNum}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-white truncate">{displayName}</p>
          <p className="text-[10px]" style={{ color: t.accent_color }}>{position}</p>
        </div>
        {!rating.isNewPlayer && (
          <span className="text-sm font-black text-white">{rating.finalRating}</span>
        )}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        className="rounded-2xl overflow-hidden relative"
        style={{ background: `linear-gradient(135deg, ${t.secondary_color} 0%, #0d1d2e 100%)` }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(ellipse at 70% 50%, ${t.primary_color} 0%, transparent 70%)`,
          }}
        />
        <div className="relative p-4 flex items-center gap-4">
          {/* Jersey + photo */}
          <div className="relative shrink-0">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${t.primary_color}, ${t.accent_color})` }}
            >
              {profile?.photo_url ? (
                <Image src={profile.photo_url} alt={player.full_name} fill className="object-cover" />
              ) : (
                player.full_name.charAt(0)
              )}
            </div>
            <div
              className="absolute -bottom-1 -right-1 text-[10px] font-black text-white w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: t.primary_color }}
            >
              {jerseyNum}
            </div>
          </div>
          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-white font-black text-sm leading-tight truncate">{firstName}</p>
            {lastName && <p className="font-black text-sm leading-tight truncate" style={{ color: t.accent_color }}>{lastName}</p>}
            <div className="flex items-center gap-2 mt-1">
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                style={{ background: `${t.primary_color}33`, color: t.accent_color }}
              >
                {position}
              </span>
              <span className="text-[10px] text-white/60">{foot} foot</span>
            </div>
          </div>
          {/* Rating */}
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

  // full / shareable
  const cardWidth = variant === 'shareable' ? 360 : undefined;

  return (
    <div className="space-y-3">
      <div
        ref={cardRef}
        className="relative overflow-hidden rounded-3xl select-none"
        style={{
          width: cardWidth,
          background: `linear-gradient(160deg, ${t.secondary_color} 0%, #0a1520 60%, #060e18 100%)`,
          aspectRatio: '3/4',
        }}
      >
        {/* Background glow */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 50% 80%, ${t.primary_color}44 0%, transparent 65%)`,
          }}
        />

        {/* Top diagonal stripe */}
        <div
          className="absolute top-0 right-0 w-3/4 h-32 opacity-20"
          style={{
            background: `linear-gradient(135deg, transparent 40%, ${t.primary_color} 100%)`,
          }}
        />

        {/* Background logo watermark */}
        {t.logo_url && (
          <div className="absolute inset-0 flex items-center justify-center opacity-5">
            <Image src={t.logo_url} alt="" width={200} height={200} className="object-contain" />
          </div>
        )}

        {/* Top row: jersey # and rating */}
        <div className="absolute top-5 left-5 right-5 flex items-start justify-between z-10">
          {/* Jersey number */}
          <div>
            <p
              className="text-6xl font-black leading-none"
              style={{
                color: 'transparent',
                WebkitTextStroke: `2px ${t.primary_color}`,
                textShadow: `0 0 20px ${t.primary_color}66`,
              }}
            >
              {jerseyNum}
            </p>
          </div>

          {/* Rating */}
          <div className="flex flex-col items-center">
            {rating.isNewPlayer ? (
              <span className="text-xs font-bold text-white/40 bg-white/10 px-2 py-1 rounded-lg">NEW PLAYER</span>
            ) : (
              <>
                <p className="text-4xl font-black text-white leading-none">{rating.finalRating}</p>
                <p className="text-[9px] font-black tracking-widest mt-0.5" style={{ color: t.accent_color }}>RATING</p>
                <StarRating rating={rating.finalRating} color={t.accent_color} />
              </>
            )}
          </div>
        </div>

        {/* Left badges: position + foot */}
        <div className="absolute left-5 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-2">
          <div
            className="px-2.5 py-1.5 rounded-xl"
            style={{ background: `${t.primary_color}cc`, backdropFilter: 'blur(4px)' }}
          >
            <p className="text-xs font-black text-white tracking-wider">{position}</p>
          </div>
          <div className="px-2 py-1 rounded-xl bg-white/10 backdrop-blur">
            <p className="text-[10px] font-bold text-white/80">{foot[0]}F</p>
          </div>
        </div>

        {/* Player photo / avatar — centered */}
        <div className="absolute inset-0 flex items-center justify-center z-0">
          <div
            className="relative flex items-end justify-center overflow-hidden"
            style={{ width: '65%', height: '65%' }}
          >
            {profile?.photo_url ? (
              <>
                <Image
                  src={profile.photo_url}
                  alt={player.full_name}
                  fill
                  className="object-cover object-top"
                  style={{ maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)' }}
                />
              </>
            ) : (
              <div className="flex items-center justify-center w-full h-full">
                <span
                  className="font-black"
                  style={{
                    fontSize: '6rem',
                    color: `${t.primary_color}33`,
                  }}
                >
                  {player.full_name.charAt(0)}
                </span>
              </div>
            )}
            {/* Bottom gradient fade over photo */}
            <div
              className="absolute bottom-0 left-0 right-0 h-1/3"
              style={{ background: `linear-gradient(to top, #060e18, transparent)` }}
            />
          </div>
        </div>

        {/* Bottom section */}
        <div className="absolute bottom-0 left-0 right-0 z-10 px-5 pb-5">
          {/* Player name */}
          <div className="mb-2">
            <p className="text-2xl font-black text-white leading-tight tracking-wide uppercase">{firstName}</p>
            {lastName && (
              <p
                className="text-2xl font-black leading-tight tracking-wide uppercase"
                style={{ color: t.accent_color }}
              >
                {lastName}
              </p>
            )}
          </div>

          {/* Team name with decorative lines */}
          <div className="flex items-center gap-2 mb-4">
            <div className="h-px flex-1 opacity-40" style={{ background: t.accent_color }} />
            <p className="text-[9px] font-black tracking-[0.2em] text-white/70 uppercase">{t.team_name}</p>
            <div className="h-px flex-1 opacity-40" style={{ background: t.accent_color }} />
          </div>

          {/* Stats grid */}
          <div
            className="rounded-2xl p-3 grid gap-2"
            style={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(8px)',
              gridTemplateColumns: `repeat(${statsRow.length}, 1fr)`,
            }}
          >
            {statsRow.map((s, i) => (
              <StatBox key={i} label={s.label} value={s.value} accent={t.accent_color} />
            ))}
          </div>
        </div>

        {/* Decorative corner accent */}
        <div
          className="absolute bottom-0 right-0 w-24 h-24 opacity-30"
          style={{
            background: `conic-gradient(from 225deg, ${t.primary_color}, transparent)`,
            clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
          }}
        />
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
            className="flex-1 h-11 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-opacity active:opacity-70 disabled:opacity-50"
            style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <Download size={16} /> {exporting ? 'Saving…' : 'Save PNG'}
          </button>
        </div>
      )}
    </div>
  );
}
