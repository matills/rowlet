/**
 * Supabase Database Types
 * 
 * These types will be auto-generated using:
 * supabase gen types typescript --project-id yruobkdtxkphxsuztgrr > src/types/database.ts
 * 
 * For now, we define a placeholder that will be replaced after running migrations.
 */

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    username: string;
                    display_name: string | null;
                    avatar_url: string | null;
                    bio: string | null;
                    is_public: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: string;
                    username: string;
                    display_name?: string | null;
                    avatar_url?: string | null;
                    bio?: string | null;
                    is_public?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    username?: string;
                    display_name?: string | null;
                    avatar_url?: string | null;
                    bio?: string | null;
                    is_public?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            content: {
                Row: {
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
                    genres: string[] | null;
                    rating: number | null;
                    episode_count: number | null;
                    season_count: number | null;
                    status: string | null;
                    raw_data: Json | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['content']['Row'], 'id' | 'created_at' | 'updated_at'> & {
                    id?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: Partial<Database['public']['Tables']['content']['Insert']>;
            };
            user_content: {
                Row: {
                    id: string;
                    user_id: string;
                    content_id: string;
                    status: 'watched' | 'watching' | 'want_to_watch' | 'dropped' | 'paused';
                    rating: number | null;
                    episodes_watched: number;
                    watched_at: string | null;
                    notes: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['user_content']['Row'], 'id' | 'created_at' | 'updated_at'> & {
                    id?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: Partial<Database['public']['Tables']['user_content']['Insert']>;
            };
            lists: {
                Row: {
                    id: string;
                    owner_id: string;
                    name: string;
                    description: string | null;
                    cover_url: string | null;
                    is_public: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['lists']['Row'], 'id' | 'created_at' | 'updated_at'> & {
                    id?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: Partial<Database['public']['Tables']['lists']['Insert']>;
            };
            achievements: {
                Row: {
                    id: string;
                    slug: string;
                    name: string;
                    description: string;
                    icon_url: string | null;
                    category: 'quantity' | 'genre' | 'streak' | 'social' | 'lists' | 'special';
                    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
                    is_hidden: boolean;
                    criteria: Json;
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['achievements']['Row'], 'id' | 'created_at'> & {
                    id?: string;
                    created_at?: string;
                };
                Update: Partial<Database['public']['Tables']['achievements']['Insert']>;
            };
            user_achievements: {
                Row: {
                    id: string;
                    user_id: string;
                    achievement_id: string;
                    unlocked_at: string;
                    progress: Json | null;
                };
                Insert: Omit<Database['public']['Tables']['user_achievements']['Row'], 'id' | 'unlocked_at'> & {
                    id?: string;
                    unlocked_at?: string;
                };
                Update: Partial<Database['public']['Tables']['user_achievements']['Insert']>;
            };
        };
        Views: Record<string, never>;
        Functions: Record<string, never>;
        Enums: {
            content_type: 'movie' | 'series' | 'anime';
            content_source: 'tmdb' | 'anilist';
            tracking_status: 'watched' | 'watching' | 'want_to_watch' | 'dropped' | 'paused';
            achievement_category: 'quantity' | 'genre' | 'streak' | 'social' | 'lists' | 'special';
            achievement_tier: 'bronze' | 'silver' | 'gold' | 'platinum';
            list_role: 'editor' | 'viewer';
        };
    };
}
