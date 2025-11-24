import type { Request } from 'express'

export type ContentType = 'movie' | 'tv' | 'anime'
export type WatchStatus = 'watching' | 'completed' | 'plan_to_watch' | 'dropped' | 'on_hold'

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
