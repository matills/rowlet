// TMDB API Types

export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  genre_ids?: number[];
  genres?: Array<{ id: number; name: string }>;
  vote_average: number;
  vote_count: number;
  runtime?: number;
  status?: string;
}

export interface TMDBSeries {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  genre_ids?: number[];
  genres?: Array<{ id: number; name: string }>;
  vote_average: number;
  vote_count: number;
  number_of_episodes?: number;
  number_of_seasons?: number;
  status?: string;
}

export interface TMDBSearchResponse {
  page: number;
  results: Array<TMDBMovie | TMDBSeries>;
  total_pages: number;
  total_results: number;
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBGenreResponse {
  genres: TMDBGenre[];
}

// Unified content type for Owlist
export interface OwlistContent {
  externalId: string;
  source: 'tmdb';
  type: 'movie' | 'series';
  title: string;
  originalTitle: string;
  year: number | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  overview: string;
  genres: string[];
  rating: number | null;
  episodeCount: number | null;
  seasonCount: number | null;
  status: string | null;
  rawData: TMDBMovie | TMDBSeries;
}
