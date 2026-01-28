---
name: owlist-supabase
description: >
  Owlist database patterns with Supabase. Covers schema design, Row Level Security,
  Auth integration, and query patterns. For generic Postgres patterns, see supabase-postgres-best-practices.
  Trigger: When working with database schema, migrations, RLS policies, or Supabase queries.
license: MIT
metadata:
  author: owlist
  version: "1.0"
  scope: [root, supabase, backend]
  auto_invoke:
    - "Working with Supabase (schema, RLS, queries)"
    - "Creating database migrations"
    - "Setting up RLS policies"
    - "Database schema questions"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash
---

## Related Skills

- `supabase-postgres-best-practices` - Generic Postgres optimization (install: `npx skills add supabase/agent-skills`)
- `owlist-api` - Backend API patterns

## Supabase Setup

```bash
# Start local Supabase
supabase start

# Create new migration
supabase migration new <migration_name>

# Reset database (runs all migrations + seed)
supabase db reset

# Generate TypeScript types
supabase gen types typescript --local > frontend/src/types/database.ts
```

## Database Schema

### Core Tables

```sql
-- Users (extends Supabase auth.users)
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

-- Content cache from external APIs
CREATE TABLE public.content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT NOT NULL,          -- TMDB or AniList ID
  source TEXT NOT NULL,               -- 'tmdb' | 'anilist'
  type TEXT NOT NULL,                 -- 'movie' | 'series' | 'anime'
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
  status TEXT,                        -- 'ongoing' | 'ended' | 'upcoming'
  raw_data JSONB,                     -- Full API response
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(external_id, source)
);

-- User tracking of content
CREATE TABLE public.user_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
  status TEXT NOT NULL,               -- 'watched' | 'watching' | 'want_to_watch' | 'dropped' | 'paused'
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
  role TEXT NOT NULL DEFAULT 'viewer',  -- 'editor' | 'viewer'
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
  category TEXT NOT NULL,             -- 'quantity' | 'genre' | 'streak' | 'social' | 'lists' | 'special'
  tier TEXT NOT NULL DEFAULT 'bronze', -- 'bronze' | 'silver' | 'gold' | 'platinum'
  is_hidden BOOLEAN DEFAULT false,
  criteria JSONB NOT NULL,            -- Conditions for unlocking
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User achievements
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  progress JSONB,                     -- For partial progress tracking
  UNIQUE(user_id, achievement_id)
);
```

### Indexes

```sql
-- Performance indexes
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
```

## Row Level Security (RLS)

### Profiles

```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can read public profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (is_public = true OR id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Profile created on signup (via trigger)
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid());
```

### User Content

```sql
ALTER TABLE public.user_content ENABLE ROW LEVEL SECURITY;

-- Users can read own content, others can see if profile is public
CREATE POLICY "User content visibility"
  ON public.user_content FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = user_id AND is_public = true
    )
  );

-- Users can manage their own content
CREATE POLICY "Users can insert own content"
  ON public.user_content FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own content"
  ON public.user_content FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own content"
  ON public.user_content FOR DELETE
  USING (user_id = auth.uid());
```

### Lists

```sql
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;

-- Public lists or own lists or collaborator
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

-- Owner can manage
CREATE POLICY "Owner can manage lists"
  ON public.lists FOR ALL
  USING (owner_id = auth.uid());
```

### List Items

```sql
ALTER TABLE public.list_items ENABLE ROW LEVEL SECURITY;

-- Can view if can view list
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

-- Owner or editor can modify
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
```

## Triggers & Functions

### Auto-update timestamps

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_content_updated_at
  BEFORE UPDATE ON public.user_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Add for other tables...
```

### Create profile on signup

```sql
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

## Query Patterns

### Frontend (Supabase Client)

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

### Common Queries

```typescript
// Get user's catalog with content details
const { data, error } = await supabase
  .from('user_content')
  .select(`
    *,
    content (*)
  `)
  .eq('user_id', userId)
  .eq('status', 'watching')
  .order('updated_at', { ascending: false });

// Get list with items and collaborators
const { data, error } = await supabase
  .from('lists')
  .select(`
    *,
    list_items (
      *,
      content (*),
      added_by:profiles!added_by (username, avatar_url)
    ),
    list_collaborators (
      *,
      user:profiles!user_id (username, avatar_url)
    )
  `)
  .eq('id', listId)
  .single();

// Upsert user content (add or update)
const { data, error } = await supabase
  .from('user_content')
  .upsert({
    user_id: userId,
    content_id: contentId,
    status: 'watching',
    episodes_watched: 5,
  }, {
    onConflict: 'user_id,content_id',
  });
```

### Pagination

```typescript
const PAGE_SIZE = 20;

const { data, error, count } = await supabase
  .from('user_content')
  .select('*, content (*)', { count: 'exact' })
  .eq('user_id', userId)
  .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)
  .order('updated_at', { ascending: false });
```

## Edge Functions

### Achievement Evaluation

```typescript
// supabase/functions/evaluate-achievements/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const { user_id, event_type, event_data } = await req.json();

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Get user stats
  const { data: stats } = await supabase
    .from('user_content')
    .select('status, content(type)')
    .eq('user_id', user_id);

  // Check achievements
  const { data: achievements } = await supabase
    .from('achievements')
    .select('*');

  const unlocked = [];

  for (const achievement of achievements || []) {
    const isUnlocked = evaluateCriteria(achievement.criteria, stats, event_data);
    if (isUnlocked) {
      await supabase.from('user_achievements').upsert({
        user_id,
        achievement_id: achievement.id,
      }, { onConflict: 'user_id,achievement_id' });
      unlocked.push(achievement);
    }
  }

  return new Response(JSON.stringify({ unlocked }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

## Commands

```bash
# Supabase CLI
supabase start                    # Start local
supabase stop                     # Stop local
supabase db reset                 # Reset database
supabase migration new <name>     # New migration
supabase migration up             # Run migrations
supabase gen types typescript --local > types/database.ts

# Direct SQL access
supabase db remote commit         # Pull remote changes
supabase db push                  # Push local to remote
```

## Best Practices

1. **Always use RLS** - Never disable, even for admin tasks
2. **Index RLS columns** - Put indexes on columns used in policies
3. **Avoid circular policies** - Don't join back to same table in policy
4. **Use security definer sparingly** - Only for trusted functions
5. **Validate on both ends** - Client AND database constraints
6. **Use transactions** - For multi-table operations
7. **Cache content table** - External API data doesn't need real-time