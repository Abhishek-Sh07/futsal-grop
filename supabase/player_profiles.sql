-- ============================================================
-- Futsal Hisab - Player Profiles & Team Settings
-- Run in Supabase SQL Editor AFTER ratings.sql
-- ============================================================

-- Player profile (card-specific data)
CREATE TABLE IF NOT EXISTS public.player_profiles (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id           uuid REFERENCES public.players(id) ON DELETE CASCADE NOT NULL UNIQUE,
  nickname            text,
  photo_url           text,
  jersey_number       text,
  preferred_position  text,
  secondary_position  text,
  strong_foot         text DEFAULT 'Right' CHECK (strong_foot IN ('Right', 'Left', 'Both')),
  playing_style       text,
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- Team settings (theme, logo, name)
CREATE TABLE IF NOT EXISTS public.team_settings (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_name       text NOT NULL DEFAULT 'Futsal Team',
  logo_url        text,
  primary_color   text NOT NULL DEFAULT '#D71920',
  secondary_color text NOT NULL DEFAULT '#07111F',
  accent_color    text NOT NULL DEFAULT '#FF3B30',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Seed one default team settings row
INSERT INTO public.team_settings (team_name, primary_color, secondary_color, accent_color)
VALUES ('Koteshwor Veteran Futsal Club', '#D71920', '#07111F', '#FF3B30')
ON CONFLICT DO NOTHING;

-- Auto-create profile row when player is added
CREATE OR REPLACE FUNCTION public.init_player_profile()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO public.player_profiles (player_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_player_created_init_profile
  AFTER INSERT ON public.players
  FOR EACH ROW EXECUTE FUNCTION public.init_player_profile();

-- Back-fill existing players
INSERT INTO public.player_profiles (player_id)
  SELECT id FROM public.players ON CONFLICT DO NOTHING;

-- Storage bucket for player photos (run separately if needed)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('player-photos', 'player-photos', true) ON CONFLICT DO NOTHING;

-- RLS
ALTER TABLE public.player_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All users can view player_profiles" ON public.player_profiles
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin can manage player_profiles" ON public.player_profiles
  FOR ALL USING (public.is_admin());

CREATE POLICY "All users can view team_settings" ON public.team_settings
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin can manage team_settings" ON public.team_settings
  FOR ALL USING (public.is_admin());

-- Updated_at trigger
CREATE TRIGGER on_player_profiles_updated BEFORE UPDATE ON public.player_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER on_team_settings_updated BEFORE UPDATE ON public.team_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
