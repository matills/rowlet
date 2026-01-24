-- Owlist Database Schema for Supabase
-- Based on the roadmap in docs/roadmap.md

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE content_type AS ENUM ('MOVIE', 'SERIES', 'ANIME');
CREATE TYPE permission_type AS ENUM ('VIEW', 'EDIT');
CREATE TYPE achievement_category AS ENUM ('QUANTITY', 'GENRE', 'STREAK', 'THEMATIC');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
  CONSTRAINT bio_length CHECK (char_length(bio) <= 500)
);

-- Content (movies, series, anime)
CREATE TABLE IF NOT EXISTS public.content (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  external_id TEXT NOT NULL, -- TMDB or Jikan ID
  type content_type NOT NULL,
  title TEXT NOT NULL,
  poster_url TEXT,
  backdrop_url TEXT,
  release_year INTEGER,
  genres TEXT[], -- Array of genre names
  api_source TEXT NOT NULL, -- 'tmdb' or 'jikan'
  metadata JSONB, -- Additional data from APIs
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(external_id, api_source)
);

-- Lists (both predefined and custom)
CREATE TABLE IF NOT EXISTS public.lists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_custom BOOLEAN NOT NULL DEFAULT false,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 100),
  CONSTRAINT description_length CHECK (char_length(description) <= 500)
);

-- List items (content in lists)
CREATE TABLE IF NOT EXISTS public.list_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  list_id UUID REFERENCES public.lists(id) ON DELETE CASCADE NOT NULL,
  content_id UUID REFERENCES public.content(id) ON DELETE CASCADE NOT NULL,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sort_order INTEGER,
  notes TEXT, -- User notes for this item

  UNIQUE(list_id, content_id)
);

-- List collaborators
CREATE TABLE IF NOT EXISTS public.list_collaborators (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  list_id UUID REFERENCES public.lists(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  permission permission_type NOT NULL DEFAULT 'VIEW',
  invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(list_id, user_id)
);

-- Reviews
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content_id UUID REFERENCES public.content(id) ON DELETE CASCADE NOT NULL,
  rating DECIMAL(3,1) NOT NULL, -- 1.0 to 10.0
  text TEXT,
  has_spoilers BOOLEAN NOT NULL DEFAULT false,
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT rating_range CHECK (rating >= 1.0 AND rating <= 10.0),
  CONSTRAINT text_length CHECK (char_length(text) <= 2000),
  UNIQUE(user_id, content_id)
);

-- Review likes
CREATE TABLE IF NOT EXISTS public.review_likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  review_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(review_id, user_id)
);

-- Achievements
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT, -- Icon identifier or emoji
  category achievement_category NOT NULL,
  threshold INTEGER, -- For numeric achievements (e.g., watch 100 movies)
  metadata JSONB, -- Additional requirements
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User achievements
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE NOT NULL,
  progress INTEGER DEFAULT 0,
  unlocked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id, achievement_id)
);

-- Follows (social feature)
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Profiles
CREATE INDEX idx_profiles_username ON public.profiles(username);

-- Content
CREATE INDEX idx_content_type ON public.content(type);
CREATE INDEX idx_content_external_id ON public.content(external_id, api_source);

-- Lists
CREATE INDEX idx_lists_user_id ON public.lists(user_id);
CREATE INDEX idx_lists_is_public ON public.lists(is_public) WHERE is_public = true;

-- List items
CREATE INDEX idx_list_items_list_id ON public.list_items(list_id);
CREATE INDEX idx_list_items_content_id ON public.list_items(content_id);

-- List collaborators
CREATE INDEX idx_list_collaborators_user_id ON public.list_collaborators(user_id);
CREATE INDEX idx_list_collaborators_list_id ON public.list_collaborators(list_id);

-- Reviews
CREATE INDEX idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX idx_reviews_content_id ON public.reviews(content_id);
CREATE INDEX idx_reviews_created_at ON public.reviews(created_at DESC);

-- Review likes
CREATE INDEX idx_review_likes_review_id ON public.review_likes(review_id);
CREATE INDEX idx_review_likes_user_id ON public.review_likes(user_id);

-- User achievements
CREATE INDEX idx_user_achievements_user_id ON public.user_achievements(user_id);

-- Follows
CREATE INDEX idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX idx_follows_following_id ON public.follows(following_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lists_updated_at
  BEFORE UPDATE ON public.lists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update review likes count
CREATE OR REPLACE FUNCTION update_review_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.reviews
    SET likes_count = likes_count + 1
    WHERE id = NEW.review_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.reviews
    SET likes_count = likes_count - 1
    WHERE id = OLD.review_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_review_likes_count_trigger
  AFTER INSERT OR DELETE ON public.review_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_review_likes_count();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Content policies (everyone can read, no one can write directly)
CREATE POLICY "Content is viewable by everyone"
  ON public.content FOR SELECT
  USING (true);

-- Lists policies
CREATE POLICY "Public lists are viewable by everyone"
  ON public.lists FOR SELECT
  USING (is_public = true OR user_id = auth.uid() OR
         EXISTS (
           SELECT 1 FROM public.list_collaborators
           WHERE list_id = id AND user_id = auth.uid()
         ));

CREATE POLICY "Users can create own lists"
  ON public.lists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lists"
  ON public.lists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own lists"
  ON public.lists FOR DELETE
  USING (auth.uid() = user_id);

-- List items policies
CREATE POLICY "List items viewable if list is viewable"
  ON public.list_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.lists
      WHERE id = list_id AND (
        is_public = true OR
        user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.list_collaborators
          WHERE list_id = lists.id AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "List items editable by owner or editors"
  ON public.list_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.lists
      WHERE id = list_id AND (
        user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.list_collaborators
          WHERE list_id = lists.id AND user_id = auth.uid() AND permission = 'EDIT'
        )
      )
    )
  );

CREATE POLICY "List items updatable by owner or editors"
  ON public.list_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.lists
      WHERE id = list_id AND (
        user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.list_collaborators
          WHERE list_id = lists.id AND user_id = auth.uid() AND permission = 'EDIT'
        )
      )
    )
  );

CREATE POLICY "List items deletable by owner or editors"
  ON public.list_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.lists
      WHERE id = list_id AND (
        user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.list_collaborators
          WHERE list_id = lists.id AND user_id = auth.uid() AND permission = 'EDIT'
        )
      )
    )
  );

-- List collaborators policies
CREATE POLICY "List collaborators viewable if list is viewable"
  ON public.list_collaborators FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.lists
      WHERE id = list_id AND (
        is_public = true OR user_id = auth.uid() OR user_id = list_collaborators.user_id
      )
    )
  );

CREATE POLICY "List owner can manage collaborators"
  ON public.list_collaborators FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.lists
      WHERE id = list_id AND user_id = auth.uid()
    )
  );

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create own reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON public.reviews FOR DELETE
  USING (auth.uid() = user_id);

-- Review likes policies
CREATE POLICY "Review likes are viewable by everyone"
  ON public.review_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can like reviews"
  ON public.review_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike own likes"
  ON public.review_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Achievements policies
CREATE POLICY "Achievements are viewable by everyone"
  ON public.achievements FOR SELECT
  USING (true);

-- User achievements policies
CREATE POLICY "User achievements are viewable by everyone"
  ON public.user_achievements FOR SELECT
  USING (true);

CREATE POLICY "Users can update own achievements"
  ON public.user_achievements FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON public.user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Follows policies
CREATE POLICY "Follows are viewable by everyone"
  ON public.follows FOR SELECT
  USING (true);

CREATE POLICY "Users can follow others"
  ON public.follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
  ON public.follows FOR DELETE
  USING (auth.uid() = follower_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to create default lists for new users
CREATE OR REPLACE FUNCTION create_default_lists_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.lists (user_id, name, description, is_custom, is_public)
  VALUES
    (NEW.id, 'Watching', 'Currently watching', false, false),
    (NEW.id, 'Completed', 'Finished watching', false, false),
    (NEW.id, 'Plan to Watch', 'Want to watch later', false, false),
    (NEW.id, 'On Hold', 'Paused for now', false, false),
    (NEW.id, 'Dropped', 'Decided not to continue', false, false);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER create_default_lists_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_lists_for_user();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
