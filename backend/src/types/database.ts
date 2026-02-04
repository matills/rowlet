// Database types based on Supabase schema
// These types match the schema in supabase/migrations/20250128000000_initial_schema.sql

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface Content {
  id: string;
  external_id: string;
  source: 'tmdb' | 'anilist';
  type: 'movie' | 'series' | 'anime';
  title: string;
  original_title: string | null;
  year: number | null;
  poster_url: string | null;
  backdrop_url: string | null;
  overview: string | null;
  genres: string[];
  rating: number | null;
  episode_count: number | null;
  season_count: number | null;
  status: string | null;
  raw_data: any;
  created_at: string;
  updated_at: string;
}

export type UserContentStatus = 'watched' | 'watching' | 'want_to_watch' | 'dropped' | 'paused';

export interface UserContent {
  id: string;
  user_id: string;
  content_id: string;
  status: UserContentStatus;
  rating: number | null;
  episodes_watched: number;
  watched_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface List {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  cover_url: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface ListItem {
  id: string;
  list_id: string;
  content_id: string;
  added_by: string;
  position: number;
  notes: string | null;
  created_at: string;
}

export type ListCollaboratorRole = 'editor' | 'viewer';

export interface ListCollaborator {
  id: string;
  list_id: string;
  user_id: string;
  role: ListCollaboratorRole;
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  content_id: string;
  rating: number | null;
  text: string;
  has_spoilers: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReviewLike {
  id: string;
  review_id: string;
  user_id: string;
  created_at: string;
}

export interface ReviewComment {
  id: string;
  review_id: string;
  user_id: string;
  text: string;
  created_at: string;
  updated_at: string;
}

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export type AchievementCategory = 'quantity' | 'genre' | 'streak' | 'social' | 'lists' | 'special';
export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface Achievement {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon_url: string | null;
  category: AchievementCategory;
  tier: AchievementTier;
  is_hidden: boolean;
  criteria: any;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  progress: any;
}
