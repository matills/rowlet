export type ActivityType =
  | 'WATCHED_MEDIA'
  | 'RATED_MEDIA'
  | 'ADDED_TO_LIST'
  | 'REMOVED_FROM_LIST'
  | 'COMPLETED_MEDIA'
  | 'CREATED_LIST'
  | 'UPDATED_LIST'
  | 'STARTED_WATCHING'
  | 'FOLLOWED_USER'
  | 'UNFOLLOWED_USER'
  | 'JOINED_COLLABORATIVE_LIST'
  | 'ADDED_TO_FAVORITES';

export interface Activity {
  id: string;
  user_id: string;
  activity_type: ActivityType;
  media_id: string | null;
  list_id: string | null;
  target_user_id: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
}

export interface ActivityWithDetails extends Activity {
  username: string;
  display_name: string;
  avatar_url: string | null;
  media_title: string | null;
  media_type: string | null;
  media_poster: string | null;
  list_name: string | null;
  list_is_public: boolean | null;
  target_username: string | null;
  target_display_name: string | null;
}

export interface CreateActivityInput {
  activity_type: ActivityType;
  media_id?: string;
  list_id?: string;
  target_user_id?: string;
  metadata?: Record<string, any>;
}

export interface PaginatedActivities {
  data: ActivityWithDetails[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
