// Content Types
export type ContentType = 'movie' | 'tv' | 'anime'

export type WatchStatus = 'watching' | 'completed' | 'plan_to_watch' | 'dropped' | 'on_hold'

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
  runtime?: number // minutes for movies
  episodeCount?: number // for series/anime
  seasonCount?: number
  status?: string // "Released", "Ongoing", "Ended", etc.
}

export interface Genre {
  id: number
  name: string
}

// User Content Tracking
export interface UserContent {
  id: string
  userId: string
  contentId: string
  content: Content
  status: WatchStatus
  userRating?: number // 1-10
  notes?: string
  episodesWatched?: number
  seasonsWatched?: number
  startDate?: string
  endDate?: string
  createdAt: string
  updatedAt: string
}

// User Lists
export interface UserList {
  id: string
  userId: string
  name: string
  description?: string
  isPublic: boolean
  items: UserListItem[]
  createdAt: string
  updatedAt: string
}

export interface UserListItem {
  id: string
  listId: string
  contentId: string
  content: Content
  order: number
  addedAt: string
}

// User Profile
export interface User {
  id: string
  email: string
  username: string
  displayName?: string
  avatarUrl?: string
  bio?: string
  isPublic: boolean
  createdAt: string
}

export interface UserStats {
  totalWatched: number
  totalWatching: number
  totalPlanToWatch: number
  totalHoursWatched: number
  movieCount: number
  tvCount: number
  animeCount: number
  favoriteGenres: GenreStat[]
  monthlyActivity: MonthlyActivity[]
}

export interface GenreStat {
  genre: Genre
  count: number
  percentage: number
}

export interface MonthlyActivity {
  month: string
  count: number
  hoursWatched: number
}

// API Response Types
export interface PaginatedResponse<T> {
  data: T[]
  page: number
  totalPages: number
  totalResults: number
}

// TMDB Types
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

// Jikan (MyAnimeList) Types
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

// Search Types
export interface SearchFilters {
  query: string
  type?: ContentType
  genre?: number
  year?: number
  page?: number
}

// Auth Types
export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials extends LoginCredentials {
  username: string
  displayName?: string
}
