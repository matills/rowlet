-- ==============================================
-- OWLIST INITIAL DATABASE SCHEMA
-- Phase 0: Fundamentos
-- ==============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================
-- TABLES
-- ==============================================

-- Profiles (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Content cache from external APIs (TMDB, AniList)
CREATE TABLE public.content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('tmdb', 'anilist')),
  type TEXT NOT NULL CHECK (type IN ('movie', 'series', 'anime')),
  title TEXT NOT NULL,
  original_title TEXT,
  year INTEGER,
  poster_url TEXT,
  backdrop_url TEXT,
  overview TEXT,
  genres TEXT[],
  rating NUMERIC(3,1),
  episode_count INTEGER,
  season_count INTEGER,
  status TEXT,
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(external_id, source)
);

-- User tracking of content
CREATE TABLE public.user_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('watched', 'watching', 'want_to_watch', 'dropped', 'paused')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 10),
  episodes_watched INTEGER DEFAULT 0,
  watched_at DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, content_id)
);

-- User lists
CREATE TABLE public.lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- List items
CREATE TABLE public.list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES public.lists(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
  added_by UUID NOT NULL REFERENCES public.profiles(id),
  position INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(list_id, content_id)
);

-- List collaborators
CREATE TABLE public.list_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES public.lists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('editor', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(list_id, user_id)
);

-- Reviews
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 10),
  text TEXT NOT NULL,
  has_spoilers BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, content_id)
);

-- Review likes
CREATE TABLE public.review_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(review_id, user_id)
);

-- Review comments
CREATE TABLE public.review_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Follows
CREATE TABLE public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Achievement definitions
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_url TEXT,
  category TEXT NOT NULL CHECK (category IN ('quantity', 'genre', 'streak', 'social', 'lists', 'special')),
  tier TEXT NOT NULL DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  is_hidden BOOLEAN DEFAULT false,
  criteria JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User achievements
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  progress JSONB,
  UNIQUE(user_id, achievement_id)
);

-- ==============================================
-- INDEXES
-- ==============================================

CREATE INDEX idx_user_content_user ON public.user_content(user_id);
CREATE INDEX idx_user_content_status ON public.user_content(user_id, status);
CREATE INDEX idx_content_external ON public.content(external_id, source);
CREATE INDEX idx_content_type ON public.content(type);
CREATE INDEX idx_lists_owner ON public.lists(owner_id);
CREATE INDEX idx_list_items_list ON public.list_items(list_id);
CREATE INDEX idx_reviews_content ON public.reviews(content_id);
CREATE INDEX idx_reviews_user ON public.reviews(user_id);
CREATE INDEX idx_follows_follower ON public.follows(follower_id);
CREATE INDEX idx_follows_following ON public.follows(following_id);
CREATE INDEX idx_user_achievements_user ON public.user_achievements(user_id);

-- ==============================================
-- FUNCTIONS
-- ==============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================
-- TRIGGERS
-- ==============================================

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_content_updated_at
  BEFORE UPDATE ON public.content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_content_updated_at
  BEFORE UPDATE ON public.user_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_lists_updated_at
  BEFORE UPDATE ON public.lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_review_comments_updated_at
  BEFORE UPDATE ON public.review_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ==============================================
-- ROW LEVEL SECURITY
-- ==============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (is_public = true OR id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- Content policies (public read, admin write)
CREATE POLICY "Content is viewable by everyone"
  ON public.content FOR SELECT
  USING (true);

-- User content policies
CREATE POLICY "User content visibility"
  ON public.user_content FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = user_id AND is_public = true
    )
  );

CREATE POLICY "Users can insert own content"
  ON public.user_content FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own content"
  ON public.user_content FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own content"
  ON public.user_content FOR DELETE
  USING (user_id = auth.uid());

-- Lists policies
CREATE POLICY "List visibility"
  ON public.lists FOR SELECT
  USING (
    is_public = true
    OR owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.list_collaborators
      WHERE list_id = id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Owner can manage lists"
  ON public.lists FOR ALL
  USING (owner_id = auth.uid());

-- List items policies
CREATE POLICY "List items visibility"
  ON public.list_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.lists
      WHERE id = list_id AND (
        is_public = true
        OR owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.list_collaborators
          WHERE list_id = lists.id AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Editors can modify list items"
  ON public.list_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.lists
      WHERE id = list_id AND owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.list_collaborators
      WHERE list_id = list_items.list_id
        AND user_id = auth.uid()
        AND role = 'editor'
    )
  );

-- List collaborators policies
CREATE POLICY "List collaborators visibility"
  ON public.list_collaborators FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.lists
      WHERE id = list_id AND (owner_id = auth.uid() OR is_public = true)
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "Owner can manage collaborators"
  ON public.list_collaborators FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.lists
      WHERE id = list_id AND owner_id = auth.uid()
    )
  );

-- Reviews policies
CREATE POLICY "Reviews visibility"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own reviews"
  ON public.reviews FOR ALL
  USING (user_id = auth.uid());

-- Review likes policies
CREATE POLICY "Review likes visibility"
  ON public.review_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own likes"
  ON public.review_likes FOR ALL
  USING (user_id = auth.uid());

-- Review comments policies
CREATE POLICY "Review comments visibility"
  ON public.review_comments FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own comments"
  ON public.review_comments FOR ALL
  USING (user_id = auth.uid());

-- Follows policies
CREATE POLICY "Follows visibility"
  ON public.follows FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own follows"
  ON public.follows FOR ALL
  USING (follower_id = auth.uid());

-- Achievements policies (public read)
CREATE POLICY "Achievements are viewable by everyone"
  ON public.achievements FOR SELECT
  USING (is_hidden = false OR EXISTS (
    SELECT 1 FROM public.user_achievements
    WHERE achievement_id = achievements.id AND user_id = auth.uid()
  ));

-- User achievements policies
CREATE POLICY "User achievements visibility"
  ON public.user_achievements FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = user_id AND is_public = true
    )
  );
