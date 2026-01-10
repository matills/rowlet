-- Migration: Achievement System
-- Description: Creates tables for achievements, user achievements, and XP/leveling system
-- Sprint: 11 - Motor de Logros

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Achievement rarity levels
CREATE TYPE achievement_rarity AS ENUM (
  'common',      -- 40% of users have it
  'rare',        -- 15% of users
  'epic',        -- 5% of users
  'legendary'    -- 1% of users
);

-- Achievement condition types
CREATE TYPE achievement_condition_type AS ENUM (
  'watched_count',           -- Total content watched (with optional type filter)
  'watched_count_timeframe', -- Content watched within a timeframe
  'rating_count',            -- Number of ratings given
  'rating_value',            -- Rating value conditions (harsh/generous)
  'genre_diversity',         -- Different genres watched
  'streak',                  -- Consecutive days/weeks/months watching
  'social',                  -- Followers, following, lists shared
  'list_creation',           -- Number of lists created
  'collaboration',           -- Collaborative list participation
  'time_of_day',             -- Content watched at specific times
  'completion',              -- Series/anime completed
  'year_filter',             -- Content from specific years
  'language_diversity',      -- Content in different languages
  'country_diversity',       -- Content from different countries
  'perfect_score',           -- Giving perfect ratings
  'speed_watching',          -- Watching content quickly
  'manual'                   -- Manually unlocked (special events, etc.)
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- Achievements definition table
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identification
  key VARCHAR(100) UNIQUE NOT NULL,  -- Unique key like 'first_steps', 'movie_buff'

  -- Display info
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  icon_url VARCHAR(500),

  -- Metadata
  rarity achievement_rarity NOT NULL DEFAULT 'common',
  xp_reward INTEGER NOT NULL DEFAULT 0,

  -- Condition configuration
  condition_type achievement_condition_type NOT NULL,
  condition_data JSONB NOT NULL DEFAULT '{}',

  -- Ordering and visibility
  display_order INTEGER DEFAULT 0,
  is_hidden BOOLEAN DEFAULT FALSE,  -- Hidden achievements (shown as ??? until unlocked)
  is_active BOOLEAN DEFAULT TRUE,   -- Can be temporarily disabled

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements (unlocked achievements)
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,

  -- Progress tracking
  current_progress INTEGER DEFAULT 0,  -- For incremental achievements
  required_progress INTEGER DEFAULT 1, -- How much progress needed (copied from achievement)

  -- Unlock info
  unlocked_at TIMESTAMP WITH TIME ZONE,
  is_unlocked BOOLEAN DEFAULT FALSE,

  -- Notification tracking
  notification_sent BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_user_achievement UNIQUE (user_id, achievement_id)
);

-- User XP and leveling
CREATE TABLE user_xp (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

  total_xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- User achievements indexes
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX idx_user_achievements_unlocked ON user_achievements(user_id, is_unlocked);
CREATE INDEX idx_user_achievements_unlocked_at ON user_achievements(unlocked_at DESC) WHERE is_unlocked = TRUE;

-- Achievements indexes
CREATE INDEX idx_achievements_condition_type ON achievements(condition_type);
CREATE INDEX idx_achievements_active ON achievements(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_achievements_rarity ON achievements(rarity);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to calculate level from total XP
-- Formula: Level = floor(sqrt(total_xp / 100)) + 1
-- This means: Level 1 = 0-99 XP, Level 2 = 100-399 XP, Level 3 = 400-899 XP, etc.
CREATE OR REPLACE FUNCTION calculate_level(xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN FLOOR(SQRT(xp::NUMERIC / 100))::INTEGER + 1;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate XP required for next level
CREATE OR REPLACE FUNCTION xp_for_next_level(current_level INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN (current_level * current_level) * 100;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to add XP to user and update level
CREATE OR REPLACE FUNCTION add_user_xp(p_user_id UUID, p_xp_amount INTEGER)
RETURNS TABLE(new_total_xp INTEGER, new_level INTEGER, leveled_up BOOLEAN) AS $$
DECLARE
  v_old_level INTEGER;
  v_new_total_xp INTEGER;
  v_new_level INTEGER;
BEGIN
  -- Get current level or create record if it doesn't exist
  INSERT INTO user_xp (user_id, total_xp, level)
  VALUES (p_user_id, 0, 1)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT level INTO v_old_level
  FROM user_xp
  WHERE user_id = p_user_id;

  -- Add XP and update level
  UPDATE user_xp
  SET
    total_xp = total_xp + p_xp_amount,
    level = calculate_level(total_xp + p_xp_amount),
    updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING total_xp, level INTO v_new_total_xp, v_new_level;

  -- Return results
  RETURN QUERY SELECT v_new_total_xp, v_new_level, (v_new_level > v_old_level);
END;
$$ LANGUAGE plpgsql;

-- Trigger function to update updated_at
CREATE OR REPLACE FUNCTION update_achievements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER update_achievements_timestamp
  BEFORE UPDATE ON achievements
  FOR EACH ROW
  EXECUTE FUNCTION update_achievements_updated_at();

CREATE TRIGGER update_user_achievements_timestamp
  BEFORE UPDATE ON user_achievements
  FOR EACH ROW
  EXECUTE FUNCTION update_achievements_updated_at();

CREATE TRIGGER update_user_xp_timestamp
  BEFORE UPDATE ON user_xp
  FOR EACH ROW
  EXECUTE FUNCTION update_achievements_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_xp ENABLE ROW LEVEL SECURITY;

-- Achievements policies (public read for active, non-hidden achievements)
CREATE POLICY "Achievements are viewable by everyone"
  ON achievements FOR SELECT
  USING (is_active = TRUE);

-- User achievements policies
CREATE POLICY "Users can view their own achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public achievements of others"
  ON user_achievements FOR SELECT
  USING (
    is_unlocked = TRUE
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = user_achievements.user_id
      AND users.is_private = FALSE
    )
  );

-- User XP policies
CREATE POLICY "Users can view their own XP"
  ON user_xp FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public XP of others"
  ON user_xp FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = user_xp.user_id
      AND users.is_private = FALSE
    )
  );

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View to get achievement progress for all users (for leaderboards, etc.)
CREATE VIEW achievement_stats AS
SELECT
  a.id AS achievement_id,
  a.key,
  a.name,
  a.rarity,
  COUNT(DISTINCT ua.user_id) FILTER (WHERE ua.is_unlocked = TRUE) AS unlock_count,
  COUNT(DISTINCT u.id) AS total_users,
  ROUND(
    (COUNT(DISTINCT ua.user_id) FILTER (WHERE ua.is_unlocked = TRUE)::NUMERIC /
     NULLIF(COUNT(DISTINCT u.id), 0) * 100),
    2
  ) AS unlock_percentage
FROM achievements a
CROSS JOIN users u
LEFT JOIN user_achievements ua ON ua.achievement_id = a.id AND ua.user_id = u.id
WHERE a.is_active = TRUE
GROUP BY a.id, a.key, a.name, a.rarity;

-- View for user achievement progress with details
CREATE VIEW user_achievement_details AS
SELECT
  ua.id,
  ua.user_id,
  ua.achievement_id,
  a.key,
  a.name,
  a.description,
  a.icon_url,
  a.rarity,
  a.xp_reward,
  ua.current_progress,
  ua.required_progress,
  ua.is_unlocked,
  ua.unlocked_at,
  a.is_hidden,
  -- Calculate progress percentage
  CASE
    WHEN ua.required_progress > 0 THEN
      ROUND((ua.current_progress::NUMERIC / ua.required_progress * 100), 2)
    ELSE 0
  END AS progress_percentage
FROM user_achievements ua
JOIN achievements a ON a.id = ua.achievement_id
WHERE a.is_active = TRUE;

-- ============================================================================
-- SEED DATA (Initial XP records for existing users)
-- ============================================================================

-- Create user_xp records for all existing users
INSERT INTO user_xp (user_id, total_xp, level)
SELECT id, 0, 1
FROM users
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE achievements IS 'Defines all available achievements in the system';
COMMENT ON TABLE user_achievements IS 'Tracks which achievements users have unlocked and their progress';
COMMENT ON TABLE user_xp IS 'Stores user XP and level information';
COMMENT ON COLUMN achievements.condition_data IS 'JSONB field storing condition parameters like {required_count: 10, media_type: "movie"}';
COMMENT ON COLUMN user_achievements.current_progress IS 'Current progress towards unlocking the achievement';
COMMENT ON COLUMN user_achievements.required_progress IS 'Total progress needed to unlock (copied from achievement definition)';
COMMENT ON FUNCTION calculate_level IS 'Calculates user level from total XP using square root formula';
COMMENT ON FUNCTION add_user_xp IS 'Adds XP to user, recalculates level, and returns whether user leveled up';
