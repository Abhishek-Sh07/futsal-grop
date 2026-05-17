-- ============================================================
-- Futsal Hisab - Player Rating Schema
-- Run in Supabase SQL Editor AFTER schema.sql and formations.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS public.player_stats (
  id                   uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id            uuid REFERENCES public.players(id) ON DELETE CASCADE NOT NULL UNIQUE,
  matches_played       int NOT NULL DEFAULT 0,
  goals                int NOT NULL DEFAULT 0,
  assists              int NOT NULL DEFAULT 0,
  wins                 int NOT NULL DEFAULT 0,
  losses               int NOT NULL DEFAULT 0,
  draws                int NOT NULL DEFAULT 0,
  mvp_count            int NOT NULL DEFAULT 0,
  yellow_cards         int NOT NULL DEFAULT 0,
  red_cards            int NOT NULL DEFAULT 0,
  attendance_percentage numeric(5,2) NOT NULL DEFAULT 0,
  clean_sheets         int NOT NULL DEFAULT 0,
  saves                int NOT NULL DEFAULT 0,
  goals_conceded       int NOT NULL DEFAULT 0,
  late_cancellations   int NOT NULL DEFAULT 0,
  no_shows             int NOT NULL DEFAULT 0,
  is_goalkeeper        boolean NOT NULL DEFAULT false,
  updated_at           timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.player_contribution (
  id                            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id                     uuid REFERENCES public.players(id) ON DELETE CASCADE NOT NULL UNIQUE,
  availability_response_points  int NOT NULL DEFAULT 0,
  assigned_position_points      int NOT NULL DEFAULT 0,
  versatility_points            int NOT NULL DEFAULT 0,
  substitute_points             int NOT NULL DEFAULT 0,
  organization_points           int NOT NULL DEFAULT 0,
  captain_points                int NOT NULL DEFAULT 0,
  updated_by                    uuid REFERENCES auth.users(id),
  updated_at                    timestamptz NOT NULL DEFAULT now()
);

-- Auto-create stats + contribution rows when a player is added
CREATE OR REPLACE FUNCTION public.init_player_rating_rows()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO public.player_stats (player_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  INSERT INTO public.player_contribution (player_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_player_created_init_rating
  AFTER INSERT ON public.players
  FOR EACH ROW EXECUTE FUNCTION public.init_player_rating_rows();

-- Back-fill existing players
INSERT INTO public.player_stats (player_id)
  SELECT id FROM public.players ON CONFLICT DO NOTHING;
INSERT INTO public.player_contribution (player_id)
  SELECT id FROM public.players ON CONFLICT DO NOTHING;

-- RLS
ALTER TABLE public.player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_contribution ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage player_stats" ON public.player_stats
  FOR ALL USING (public.is_admin());
CREATE POLICY "All users can view player_stats" ON public.player_stats
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin can manage player_contribution" ON public.player_contribution
  FOR ALL USING (public.is_admin());
CREATE POLICY "All users can view player_contribution" ON public.player_contribution
  FOR SELECT USING (auth.uid() IS NOT NULL);
