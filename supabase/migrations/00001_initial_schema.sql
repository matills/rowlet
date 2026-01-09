CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE media_type AS ENUM ('movie', 'series', 'anime');
CREATE TYPE anime_subtype AS ENUM ('tv', 'movie', 'ova', 'ona', 'special', 'music');
CREATE TYPE media_source AS ENUM ('tmdb', 'anilist');
CREATE TYPE user_media_status AS ENUM (
  'watching',
  'completed',
  'plan_to_watch',
  'on_hold',
  'dropped'
);

CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  banner_url TEXT,

  is_private BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
  CONSTRAINT username_format CHECK (username ~* '^[a-z0-9_]+$')
);

CREATE TABLE public.media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  title TEXT NOT NULL,
  original_title TEXT,
  overview TEXT,

  type media_type NOT NULL,
  subtype anime_subtype,
  source media_source NOT NULL,
  external_id TEXT NOT NULL,

  poster_path TEXT,
  backdrop_path TEXT,
  release_date DATE,
  end_date DATE,

  genres TEXT[],
  studios TEXT[],
  score DECIMAL(3, 1),
  popularity DECIMAL(10, 2),

  total_episodes INTEGER,
  episode_duration INTEGER,
  status TEXT,

  tmdb_data JSONB,
  anilist_data JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(source, external_id)
);

CREATE INDEX idx_media_title ON media USING gin(to_tsvector('english', title));
CREATE INDEX idx_media_type ON media(type);
CREATE INDEX idx_media_source ON media(source);
CREATE INDEX idx_media_external_id ON media(source, external_id);

CREATE TABLE public.seasons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  media_id UUID REFERENCES media(id) ON DELETE CASCADE,

  season_number INTEGER NOT NULL,
  name TEXT,
  overview TEXT,
  poster_path TEXT,

  air_date DATE,
  episode_count INTEGER,

  external_id TEXT,
  tmdb_data JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(media_id, season_number)
);

CREATE TABLE public.episodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  season_id UUID REFERENCES seasons(id) ON DELETE CASCADE,

  episode_number INTEGER NOT NULL,
  name TEXT,
  overview TEXT,
  still_path TEXT,

  air_date DATE,
  runtime INTEGER,

  external_id TEXT,
  tmdb_data JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(season_id, episode_number)
);

CREATE TABLE public.user_media_list (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  media_id UUID REFERENCES media(id) ON DELETE CASCADE,

  status user_media_status NOT NULL,

  episodes_watched INTEGER DEFAULT 0,

  score DECIMAL(3, 1),
  notes TEXT,

  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  rewatch_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, media_id)
);

CREATE INDEX idx_user_media_user ON user_media_list(user_id);
CREATE INDEX idx_user_media_status ON user_media_list(user_id, status);

CREATE TABLE public.custom_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,

  is_public BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT list_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 100)
);

CREATE INDEX idx_custom_lists_user ON custom_lists(user_id);

CREATE TABLE public.custom_list_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  list_id UUID REFERENCES custom_lists(id) ON DELETE CASCADE,
  media_id UUID REFERENCES media(id) ON DELETE CASCADE,

  position INTEGER NOT NULL DEFAULT 0,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(list_id, media_id)
);

CREATE INDEX idx_custom_list_items ON custom_list_items(list_id);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_media_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_list_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can view public profiles"
  ON users FOR SELECT
  USING (is_private = false);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can view their own media list"
  ON user_media_list FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public media lists"
  ON user_media_list FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = user_media_list.user_id
      AND users.is_private = false
    )
  );

CREATE POLICY "Users can insert to their media list"
  ON user_media_list FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their media list"
  ON user_media_list FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from their media list"
  ON user_media_list FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own lists"
  ON custom_lists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public lists"
  ON custom_lists FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can create lists"
  ON custom_lists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their lists"
  ON custom_lists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their lists"
  ON custom_lists FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view items from accessible lists"
  ON custom_list_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM custom_lists
      WHERE custom_lists.id = custom_list_items.list_id
      AND (custom_lists.user_id = auth.uid() OR custom_lists.is_public = true)
    )
  );

CREATE POLICY "Users can manage items in their lists"
  ON custom_list_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM custom_lists
      WHERE custom_lists.id = custom_list_items.list_id
      AND custom_lists.user_id = auth.uid()
    )
  );

ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Media is viewable by everyone"
  ON media FOR SELECT
  USING (true);

CREATE POLICY "Seasons are viewable by everyone"
  ON seasons FOR SELECT
  USING (true);

CREATE POLICY "Episodes are viewable by everyone"
  ON episodes FOR SELECT
  USING (true);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_media_updated_at BEFORE UPDATE ON media
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_user_media_list_updated_at BEFORE UPDATE ON user_media_list
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_custom_lists_updated_at BEFORE UPDATE ON custom_lists
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

COMMENT ON TABLE users IS 'Extended user profiles (extends auth.users)';
COMMENT ON TABLE media IS 'All media content (movies, series, anime) from TMDB and AniList';
COMMENT ON TABLE user_media_list IS 'User tracking of media (watching, completed, etc.)';
COMMENT ON TABLE custom_lists IS 'User-created custom lists';
COMMENT ON TABLE custom_list_items IS 'Items in custom lists';
