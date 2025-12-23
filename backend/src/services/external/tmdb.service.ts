import axios, { AxiosInstance } from 'axios';
import { env } from '../../config/env';
import { logger } from '../../config/logger';
import { cacheService } from '../cache.service';

// TMDB API Response Types
export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  genre_ids: number[];
  genres?: Array<{ id: number; name: string }>;
  vote_average: number;
  popularity: number;
  runtime?: number;
}

export interface TMDBSeries {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  last_air_date?: string;
  genre_ids: number[];
  genres?: Array<{ id: number; name: string }>;
  vote_average: number;
  popularity: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  episode_run_time?: number[];
  status?: string;
}

export interface TMDBSeason {
  id: number;
  season_number: number;
  name: string;
  overview: string;
  poster_path: string | null;
  air_date: string;
  episode_count: number;
  episodes?: TMDBEpisode[];
}

export interface TMDBEpisode {
  id: number;
  episode_number: number;
  name: string;
  overview: string;
  still_path: string | null;
  air_date: string;
  runtime: number;
  vote_average: number;
}

export interface TMDBSearchResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export class TMDBService {
  private client: AxiosInstance;
  private apiKey: string;

  constructor() {
    this.apiKey = env.TMDB_API_KEY;

    this.client = axios.create({
      baseURL: env.TMDB_API_URL,
      params: {
        api_key: this.apiKey,
      },
    });
  }

  /**
   * Search for movies
   */
  async searchMovies(
    query: string,
    page: number = 1
  ): Promise<TMDBSearchResponse<TMDBMovie>> {
    const cacheKey = cacheService.keys.tmdbSearchMovies(query, page);

    return cacheService.getOrFetch(
      cacheKey,
      async () => {
        try {
          const { data } = await this.client.get<TMDBSearchResponse<TMDBMovie>>(
            '/search/movie',
            {
              params: { query, page },
            }
          );

          return data;
        } catch (error) {
          logger.error('TMDB search movies error:', error);
          throw new Error('Failed to search movies from TMDB');
        }
      },
      cacheService.getTTL().MEDIUM
    );
  }

  /**
   * Search for TV series
   */
  async searchSeries(
    query: string,
    page: number = 1
  ): Promise<TMDBSearchResponse<TMDBSeries>> {
    const cacheKey = cacheService.keys.tmdbSearchSeries(query, page);

    return cacheService.getOrFetch(
      cacheKey,
      async () => {
        try {
          const { data } = await this.client.get<TMDBSearchResponse<TMDBSeries>>(
            '/search/tv',
            {
              params: { query, page },
            }
          );

          return data;
        } catch (error) {
          logger.error('TMDB search series error:', error);
          throw new Error('Failed to search series from TMDB');
        }
      },
      cacheService.getTTL().MEDIUM
    );
  }

  /**
   * Get movie details by ID
   */
  async getMovieDetails(movieId: number): Promise<TMDBMovie> {
    const cacheKey = cacheService.keys.tmdbMovie(movieId);

    return cacheService.getOrFetch(
      cacheKey,
      async () => {
        try {
          const { data } = await this.client.get<TMDBMovie>(`/movie/${movieId}`);

          return data;
        } catch (error) {
          logger.error('TMDB get movie details error:', error);
          throw new Error('Failed to get movie details from TMDB');
        }
      },
      cacheService.getTTL().LONG
    );
  }

  /**
   * Get TV series details by ID
   */
  async getSeriesDetails(seriesId: number): Promise<TMDBSeries> {
    const cacheKey = cacheService.keys.tmdbSeries(seriesId);

    return cacheService.getOrFetch(
      cacheKey,
      async () => {
        try {
          const { data } = await this.client.get<TMDBSeries>(`/tv/${seriesId}`);

          return data;
        } catch (error) {
          logger.error('TMDB get series details error:', error);
          throw new Error('Failed to get series details from TMDB');
        }
      },
      cacheService.getTTL().LONG
    );
  }

  /**
   * Get season details with episodes
   */
  async getSeasonDetails(
    seriesId: number,
    seasonNumber: number
  ): Promise<TMDBSeason> {
    const cacheKey = cacheService.keys.tmdbSeason(seriesId, seasonNumber);

    return cacheService.getOrFetch(
      cacheKey,
      async () => {
        try {
          const { data } = await this.client.get<TMDBSeason>(
            `/tv/${seriesId}/season/${seasonNumber}`
          );

          return data;
        } catch (error) {
          logger.error('TMDB get season details error:', error);
          throw new Error('Failed to get season details from TMDB');
        }
      },
      cacheService.getTTL().LONG
    );
  }

  /**
   * Get popular movies
   */
  async getPopularMovies(
    page: number = 1
  ): Promise<TMDBSearchResponse<TMDBMovie>> {
    const cacheKey = cacheService.keys.tmdbPopularMovies(page);

    return cacheService.getOrFetch(
      cacheKey,
      async () => {
        try {
          const { data} = await this.client.get<TMDBSearchResponse<TMDBMovie>>(
            '/movie/popular',
            {
              params: { page },
            }
          );

          return data;
        } catch (error) {
          logger.error('TMDB get popular movies error:', error);
          throw new Error('Failed to get popular movies from TMDB');
        }
      },
      cacheService.getTTL().SHORT
    );
  }

  /**
   * Get popular TV series
   */
  async getPopularSeries(
    page: number = 1
  ): Promise<TMDBSearchResponse<TMDBSeries>> {
    const cacheKey = cacheService.keys.tmdbPopularSeries(page);

    return cacheService.getOrFetch(
      cacheKey,
      async () => {
        try {
          const { data } = await this.client.get<TMDBSearchResponse<TMDBSeries>>(
            '/tv/popular',
            {
              params: { page },
            }
          );

          return data;
        } catch (error) {
          logger.error('TMDB get popular series error:', error);
          throw new Error('Failed to get popular series from TMDB');
        }
      },
      cacheService.getTTL().SHORT
    );
  }

  /**
   * Get trending movies/series
   */
  async getTrending(
    mediaType: 'movie' | 'tv' = 'movie',
    timeWindow: 'day' | 'week' = 'week',
    page: number = 1
  ): Promise<TMDBSearchResponse<TMDBMovie | TMDBSeries>> {
    const cacheKey = cacheService.keys.tmdbTrending(mediaType, timeWindow, page);

    return cacheService.getOrFetch(
      cacheKey,
      async () => {
        try {
          const { data } = await this.client.get(
            `/trending/${mediaType}/${timeWindow}`,
            {
              params: { page },
            }
          );

          return data;
        } catch (error) {
          logger.error('TMDB get trending error:', error);
          throw new Error('Failed to get trending from TMDB');
        }
      },
      cacheService.getTTL().SHORT
    );
  }
}

export const tmdbService = new TMDBService();
