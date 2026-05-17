-- ============================================================
-- Futsal Hisab - Formations Schema
-- Run this in your Supabase SQL editor AFTER schema.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS public.formations (
  id           uuid primary key default uuid_generate_v4(),
  name         text not null,
  match_type   text not null check (match_type in ('5v5', '7v7')),
  notes        text,
  created_by   uuid references auth.users(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS public.formation_players (
  id            uuid primary key default uuid_generate_v4(),
  formation_id  uuid references public.formations(id) on delete cascade not null,
  player_id     uuid references public.players(id) on delete cascade not null,
  role          text not null default 'unavailable' check (role in ('starter', 'substitute', 'unavailable')),
  position_x    numeric,
  position_y    numeric,
  created_at    timestamptz not null default now(),
  unique(formation_id, player_id)
);

CREATE TRIGGER on_formations_updated BEFORE UPDATE ON public.formations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.formations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.formation_players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage formations" ON public.formations
  FOR ALL USING (public.is_admin());
CREATE POLICY "Players can view formations" ON public.formations
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin can manage formation_players" ON public.formation_players
  FOR ALL USING (public.is_admin());
CREATE POLICY "Players can view formation_players" ON public.formation_players
  FOR SELECT USING (auth.uid() IS NOT NULL);
