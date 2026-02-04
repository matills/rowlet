import axios, { AxiosInstance } from 'axios';
import type {
  TMDBMovie,
  TMDBSeries,
  TMDBSearchResponse,
  TMDBGenreResponse,
  OwlistContent,
} from './types.js';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export class TMDBClient {
  private client: AxiosInstance;
  private apiKey: string;
  private genreCache: Map<number, string> = new Map();

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('TMDB API key is required');
    }

    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL: TMDB_BASE_URL,
      params: {
        api_key: this.apiKey,
      },
      timeout: 10000,
    });
  }

  /**
   * Initialize genre cache
   */
  async initializeGenres(): Promise<void> {
    try {
      const [movieGenres, tvGenres] = await Promise.all([
        this.client.get<TMDBGenreResponse>('/genre/movie/list'),
        this.client.get<TMDBGenreResponse>('/genre/tv/list'),
      ]);

      const allGenres = [
        ...movieGenres.data.genres,
        ...tvGenres.data.genres,
      ];

      for (const genre of allGenres) {
        this.genreCache.set(genre.id, genre.name);
      }
    } catch (error) {
      console.error('Failed to initialize TMDB genres:', error);
    }
  }

  /**
   * Search for movies and TV shows
   */
  async search(query: string, page = 1): Promise<OwlistContent[]> {
    try {
      const response = await this.client.get<TMDBSearchResponse>('/search/multi', {
        params: {
          query,
          page,
          include_adult: false,
        },
      });

      return response.data.results
        .filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv')
        .map((item: any) => this.normalizeContent(item, item.media_type));
    } catch (error) {
      console.error('TMDB search error:', error);
      throw new Error('Failed to search TMDB');
    }
  }

  /**
   * Search movies only
   */
  async searchMovies(query: string, page = 1): Promise<OwlistContent[]> {
    try {
      const response = await this.client.get<TMDBSearchResponse>('/search/movie', {
        params: {
          query,
          page,
          include_adult: false,
        },
      });

      return response.data.results.map((movie) => this.normalizeMovie(movie as TMDBMovie));
    } catch (error) {
      console.error('TMDB movie search error:', error);
      throw new Error('Failed to search movies');
    }
  }

  /**
   * Search TV shows only
   */
  async searchSeries(query: string, page = 1): Promise<OwlistContent[]> {
    try {
      const response = await this.client.get<TMDBSearchResponse>('/search/tv', {
        params: {
          query,
          page,
          include_adult: false,
        },
      });

      return response.data.results.map((series) => this.normalizeSeries(series as TMDBSeries));
    } catch (error) {
      console.error('TMDB series search error:', error);
      throw new Error('Failed to search series');
    }
  }

  /**
   * Get movie details by ID
   */
  async getMovie(id: number): Promise<OwlistContent> {
    try {
      const response = await this.client.get<TMDBMovie>(`/movie/${id}`);
      return this.normalizeMovie(response.data);
    } catch (error) {
      console.error('TMDB get movie error:', error);
      throw new Error('Failed to get movie details');
    }
  }

  /**
   * Get TV show details by ID
   */
  async getSeries(id: number): Promise<OwlistContent> {
    try {
      const response = await this.client.get<TMDBSeries>(`/tv/${id}`);
      return this.normalizeSeries(response.data);
    } catch (error) {
      console.error('TMDB get series error:', error);
      throw new Error('Failed to get series details');
    }
  }

  /**
   * Normalize content based on media type
   */
  private normalizeContent(item: any, mediaType: 'movie' | 'tv'): OwlistContent {
    if (mediaType === 'movie') {
      return this.normalizeMovie(item);
    } else {
      return this.normalizeSeries(item);
    }
  }

  /**
   * Normalize movie to Owlist content format
   */
  private normalizeMovie(movie: TMDBMovie): OwlistContent {
    const year = movie.release_date
      ? new Date(movie.release_date).getFullYear()
      : null;

    const genres = this.getGenreNames(movie.genre_ids || movie.genres?.map(g => g.id) || []);

    return {
      externalId: movie.id.toString(),
      source: 'tmdb',
      type: 'movie',
      title: movie.title,
      originalTitle: movie.original_title,
      year,
      posterUrl: movie.poster_path
        ? `${TMDB_IMAGE_BASE_URL}/w500${movie.poster_path}`
        : null,
      backdropUrl: movie.backdrop_path
        ? `${TMDB_IMAGE_BASE_URL}/original${movie.backdrop_path}`
        : null,
      overview: movie.overview || '',
      genres,
      rating: movie.vote_average ? Number(movie.vote_average.toFixed(1)) : null,
      episodeCount: null,
      seasonCount: null,
      status: movie.status || null,
      rawData: movie,
    };
  }

  /**
   * Normalize TV series to Owlist content format
   */
  private normalizeSeries(series: TMDBSeries): OwlistContent {
    const year = series.first_air_date
      ? new Date(series.first_air_date).getFullYear()
      : null;

    const genres = this.getGenreNames(series.genre_ids || series.genres?.map(g => g.id) || []);

    return {
      externalId: series.id.toString(),
      source: 'tmdb',
      type: 'series',
      title: series.name,
      originalTitle: series.original_name,
      year,
      posterUrl: series.poster_path
        ? `${TMDB_IMAGE_BASE_URL}/w500${series.poster_path}`
        : null,
      backdropUrl: series.backdrop_path
        ? `${TMDB_IMAGE_BASE_URL}/original${series.backdrop_path}`
        : null,
      overview: series.overview || '',
      genres,
      rating: series.vote_average ? Number(series.vote_average.toFixed(1)) : null,
      episodeCount: series.number_of_episodes || null,
      seasonCount: series.number_of_seasons || null,
      status: series.status || null,
      rawData: series,
    };
  }

  /**
   * Convert genre IDs to names
   */
  private getGenreNames(genreIds: number[]): string[] {
    return genreIds
      .map((id) => this.genreCache.get(id))
      .filter((name): name is string => name !== undefined);
  }
}

// Singleton instance
let tmdbClient: TMDBClient | null = null;

export function getTMDBClient(): TMDBClient {
  if (!tmdbClient) {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      throw new Error('TMDB_API_KEY environment variable is not set');
    }
    tmdbClient = new TMDBClient(apiKey);
    // Initialize genres cache
    tmdbClient.initializeGenres();
  }
  return tmdbClient;
}
