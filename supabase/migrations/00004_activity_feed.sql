CREATE TYPE activity_type AS ENUM (
  'WATCHED_MEDIA',
  'RATED_MEDIA',
  'ADDED_TO_LIST',
  'REMOVED_FROM_LIST',
  'COMPLETED_MEDIA',
  'CREATED_LIST',
  'UPDATED_LIST',
  'STARTED_WATCHING',
  'FOLLOWED_USER',
  'UNFOLLOWED_USER',
  'JOINED_COLLABORATIVE_LIST',
  'ADDED_TO_FAVORITES'
);

CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type activity_type NOT NULL,

  media_id UUID REFERENCES media(id) ON DELETE SET NULL,
  list_id UUID REFERENCES custom_lists(id) ON DELETE SET NULL,
  target_user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  metadata JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CHECK (
    (activity_type IN ('WATCHED_MEDIA', 'RATED_MEDIA', 'COMPLETED_MEDIA', 'STARTED_WATCHING', 'ADDED_TO_FAVORITES') AND media_id IS NOT NULL)
    OR (activity_type IN ('ADDED_TO_LIST', 'REMOVED_FROM_LIST') AND media_id IS NOT NULL AND list_id IS NOT NULL)
    OR (activity_type IN ('CREATED_LIST', 'UPDATED_LIST') AND list_id IS NOT NULL)
    OR (activity_type IN ('FOLLOWED_USER', 'UNFOLLOWED_USER') AND target_user_id IS NOT NULL)
    OR (activity_type = 'JOINED_COLLABORATIVE_LIST' AND list_id IS NOT NULL)
  )
);

CREATE INDEX idx_activities_user ON activities(user_id, created_at DESC);
CREATE INDEX idx_activities_type ON activities(activity_type);
CREATE INDEX idx_activities_created_at ON activities(created_at DESC);
CREATE INDEX idx_activities_media ON activities(media_id) WHERE media_id IS NOT NULL;
CREATE INDEX idx_activities_list ON activities(list_id) WHERE list_id IS NOT NULL;
CREATE INDEX idx_activities_target_user ON activities(target_user_id) WHERE target_user_id IS NOT NULL;

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activities"
  ON activities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public activities"
  ON activities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = activities.user_id
      AND users.is_private = false
    )
  );

CREATE POLICY "Users can view activities from followed users"
  ON activities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM follows
      WHERE follows.follower_id = auth.uid()
      AND follows.following_id = activities.user_id
    )
  );

CREATE POLICY "Users can create their own activities"
  ON activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activities"
  ON activities FOR DELETE
  USING (auth.uid() = user_id);

CREATE OR REPLACE VIEW feed_activities AS
SELECT
  a.id,
  a.user_id,
  a.activity_type,
  a.media_id,
  a.list_id,
  a.target_user_id,
  a.metadata,
  a.created_at,
  u.username,
  u.display_name,
  u.avatar_url,
  m.title as media_title,
  m.type as media_type,
  m.poster_path as media_poster,
  l.name as list_name,
  l.is_public as list_is_public,
  tu.username as target_username,
  tu.display_name as target_display_name
FROM activities a
LEFT JOIN users u ON u.id = a.user_id
LEFT JOIN media m ON m.id = a.media_id
LEFT JOIN custom_lists l ON l.id = a.list_id
LEFT JOIN users tu ON tu.id = a.target_user_id;

GRANT SELECT ON feed_activities TO authenticated, anon;

CREATE OR REPLACE FUNCTION get_following_ids(user_id UUID)
RETURNS TABLE(following_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT f.following_id
  FROM follows f
  WHERE f.follower_id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE activities IS 'User activities for activity feed';
COMMENT ON VIEW feed_activities IS 'Enriched activity feed with user, media, and list details';
