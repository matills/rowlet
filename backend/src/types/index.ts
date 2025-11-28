import type { Request } from 'express'

export type ContentType = 'movie' | 'tv' | 'anime'
export type WatchStatus = 'watching' | 'completed' | 'plan_to_watch' | 'dropped' | 'on_hold'

// Database table types (matching Supabase schema with snake_case)
export interface DbUser {
  id: string
  email: string
  password: string
  username: string
  display_name?: string | null
  avatar_url?: string | null
  bio?: string | null
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface DbContent {
  id: string
  external_id: string
  type: string
  title: string
  original_title?: string | null
  poster_path?: string | null
  backdrop_path?: string | null
  overview?: string | null
  release_date?: string | null
  genres?: any // JSONB
  rating?: number | null
  vote_count?: number | null
  runtime?: number | null
  episode_count?: number | null
  season_count?: number | null
  status?: string | null
  created_at: string
  updated_at: string
}

export interface DbUserContent {
  id: string
  user_id: string
  content_id: string
  status: string
  user_rating?: number | null
  notes?: string | null
  episodes_watched?: number | null
  seasons_watched?: number | null
  start_date?: string | null
  end_date?: string | null
  created_at: string
  updated_at: string
}

export interface DbUserList {
  id: string
  user_id: string
  name: string
  description?: string | null
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface DbListItem {
  id: string
  list_id: string
  content_id: string
  order: number
  added_at: string
}

// Application types (camelCase for API responses)
export interface User {
  id: string
  email: string
  username: string
  displayName?: string
  avatarUrl?: string
  bio?: string
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
}

export interface JWTPayload {
  userId: string
  email: string
}

export interface AuthRequest extends Request {
  user?: JWTPayload
}

export interface Content {
  id: string
  externalId: string
  type: ContentType
  title: string
  originalTitle?: string
  posterPath?: string
  backdropPath?: string
  overview?: string
  releaseDate?: string
  genres: Genre[]
  rating?: number
  voteCount?: number
  runtime?: number
  episodeCount?: number
  seasonCount?: number
  status?: string
  productionCompanies?: string[]
  studios?: string[]
  originalLanguage?: string
  popularity?: number
}

export interface Genre {
  id: number
  name: string
}

export interface UserContent {
  id: string
  userId: string
  contentId: string
  content: Content
  status: WatchStatus
  userRating?: number
  notes?: string
  episodesWatched?: number
  seasonsWatched?: number
  startDate?: Date
  endDate?: Date
  createdAt: Date
  updatedAt: Date
}

export interface PaginatedResponse<T> {
  data: T[]
  page: number
  totalPages: number
  totalResults: number
}

// TMDB Types
export interface TMDBSearchResult {
  page: number
  results: TMDBMovie[] | TMDBTVShow[]
  total_pages: number
  total_results: number
}

export interface TMDBMovie {
  id: number
  title: string
  original_title: string
  poster_path: string | null
  backdrop_path: string | null
  overview: string
  release_date: string
  genre_ids: number[]
  vote_average: number
  vote_count: number
  runtime?: number
}

export interface TMDBTVShow {
  id: number
  name: string
  original_name: string
  poster_path: string | null
  backdrop_path: string | null
  overview: string
  first_air_date: string
  genre_ids: number[]
  vote_average: number
  vote_count: number
  number_of_episodes?: number
  number_of_seasons?: number
  status?: string
}

// Types for detailed responses (when fetching by ID)
export interface TMDBMovieDetails extends Omit<TMDBMovie, 'genre_ids'> {
  genres: Genre[]
  runtime: number
  status?: string
  tagline?: string
  production_companies?: Array<{ id: number; name: string }>
  original_language?: string
  popularity?: number
}

export interface TMDBTVShowDetails extends Omit<TMDBTVShow, 'genre_ids'> {
  genres: Genre[]
  episode_run_time?: number[]
  production_companies?: Array<{ id: number; name: string }>
  original_language?: string
  popularity?: number
}

// Jikan Types
export interface JikanSearchResult {
  pagination: {
    last_visible_page: number
    has_next_page: boolean
    items: {
      count: number
      total: number
      per_page: number
    }
  }
  data: JikanAnime[]
}

export interface JikanAnime {
  mal_id: number
  title: string
  title_english: string | null
  images: {
    jpg: {
      image_url: string
      large_image_url: string
    }
  }
  synopsis: string
  aired: {
    from: string
    to: string | null
  }
  episodes: number | null
  status: string
  score: number
  scored_by: number
  genres: Array<{ mal_id: number; name: string }>
}
