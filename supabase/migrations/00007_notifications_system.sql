CREATE TYPE notification_type AS ENUM (
  'achievement_unlocked',
  'level_up',
  'new_follower',
  'list_invitation',
  'list_invitation_accepted',
  'user_activity',
  'episode_reminder',
  'review_comment',
  'list_item_added',
  'system'
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,

  data JSONB,

  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

  achievement_unlocked BOOLEAN DEFAULT TRUE,
  level_up BOOLEAN DEFAULT TRUE,
  new_follower BOOLEAN DEFAULT TRUE,
  list_invitation BOOLEAN DEFAULT TRUE,
  list_invitation_accepted BOOLEAN DEFAULT TRUE,
  user_activity BOOLEAN DEFAULT TRUE,
  episode_reminder BOOLEAN DEFAULT FALSE,
  review_comment BOOLEAN DEFAULT TRUE,
  list_item_added BOOLEAN DEFAULT TRUE,
  system BOOLEAN DEFAULT TRUE,

  email_enabled BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM notifications
    WHERE user_id = p_user_id AND is_read = FALSE
  );
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION create_notification_preferences_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_notification_preferences
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION create_notification_preferences_for_new_user();
