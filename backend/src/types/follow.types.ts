export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface FollowUser {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  is_private: boolean;
  followed_at?: string; // Date when the follow relationship was created
}

export interface FollowCounts {
  followers_count: number;
  following_count: number;
}

export interface FollowStatus {
  isFollowing: boolean;
  isFollowedBy: boolean; // Does the target user follow you back?
}

export interface PaginatedFollows {
  data: FollowUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
