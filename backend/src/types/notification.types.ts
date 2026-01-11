export enum NotificationType {
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  LEVEL_UP = 'level_up',
  NEW_FOLLOWER = 'new_follower',
  LIST_INVITATION = 'list_invitation',
  LIST_INVITATION_ACCEPTED = 'list_invitation_accepted',
  USER_ACTIVITY = 'user_activity',
  EPISODE_REMINDER = 'episode_reminder',
  REVIEW_COMMENT = 'review_comment',
  LIST_ITEM_ADDED = 'list_item_added',
  SYSTEM = 'system',
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export interface NotificationPreferences {
  user_id: string;
  achievement_unlocked: boolean;
  level_up: boolean;
  new_follower: boolean;
  list_invitation: boolean;
  list_invitation_accepted: boolean;
  user_activity: boolean;
  episode_reminder: boolean;
  review_comment: boolean;
  list_item_added: boolean;
  system: boolean;
  email_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateNotificationDTO {
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
}

export interface UpdateNotificationPreferencesDTO {
  achievement_unlocked?: boolean;
  level_up?: boolean;
  new_follower?: boolean;
  list_invitation?: boolean;
  list_invitation_accepted?: boolean;
  user_activity?: boolean;
  episode_reminder?: boolean;
  review_comment?: boolean;
  list_item_added?: boolean;
  system?: boolean;
  email_enabled?: boolean;
}

export interface GetNotificationsQuery {
  limit?: number;
  offset?: number;
  is_read?: boolean;
  type?: NotificationType;
}

export interface NotificationPayload {
  achievement_unlocked?: {
    achievement_id: string;
    achievement_key: string;
    achievement_name: string;
    rarity: string;
    xp_awarded: number;
  };
  level_up?: {
    old_level: number;
    new_level: number;
    total_xp: number;
  };
  new_follower?: {
    follower_id: string;
    follower_username: string;
  };
  list_invitation?: {
    list_id: string;
    list_name: string;
    inviter_id: string;
    inviter_username: string;
    role: string;
  };
  user_activity?: {
    user_id: string;
    username: string;
    activity_type: string;
    media_id?: string;
    media_title?: string;
  };
}
