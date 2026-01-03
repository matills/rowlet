import axios, { AxiosInstance } from 'axios';
import { env } from '../../config/env';
import { logger } from '../../config/logger';
import { cacheService } from '../cache.service';

// AniList API Response Types
export interface AniListAnime {
  id: number;
  title: {
    romaji: string;
    english: string | null;
    native: string;
  };
  description: string;
  coverImage: {
    large: string;
    medium: string;
  };
  bannerImage: string | null;
  startDate: {
    year: number | null;
    month: number | null;
    day: number | null;
  };
  endDate: {
    year: number | null;
    month: number | null;
    day: number | null;
  };
  format: string; // TV, MOVIE, OVA, ONA, SPECIAL, MUSIC
  episodes: number | null;
  duration: number | null;
  status: string; // FINISHED, RELEASING, NOT_YET_RELEASED, CANCELLED
  genres: string[];
  studios: {
    nodes: Array<{ name: string }>;
  };
  averageScore: number | null;
  popularity: number;
}

export interface AniListSearchResponse {
  Page: {
    pageInfo: {
      total: number;
      currentPage: number;
      lastPage: number;
      hasNextPage: boolean;
      perPage: number;
    };
    media: AniListAnime[];
  };
}

export class AniListService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: env.ANILIST_API_URL,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
  }

  /**
   * Execute a GraphQL query
   */
  private async query<T>(query: string, variables: any = {}): Promise<T> {
    try {
      const { data } = await this.client.post<{ data: T }>('', {
        query,
        variables,
      });

      return data.data;
    } catch (error: any) {
      logger.error('AniList GraphQL error:', error.response?.data || error);
      throw new Error('Failed to query AniList API');
    }
  }

  /**
   * Search for anime
   */
  async searchAnime(search: string, page: number = 1, perPage: number = 20): Promise<AniListSearchResponse> {
    const cacheKey = cacheService.keys.anilistSearch(search, page);

    return cacheService.getOrFetch(
      cacheKey,
      async () => {
        const query = `
          query ($search: String, $page: Int, $perPage: Int) {
            Page(page: $page, perPage: $perPage) {
              pageInfo {
                total
                currentPage
                lastPage
                hasNextPage
                perPage
              }
              media(search: $search, type: ANIME) {
                id
                title {
                  romaji
                  english
                  native
                }
                description
                coverImage {
                  large
                  medium
                }
                bannerImage
                startDate {
                  year
                  month
                  day
                }
                endDate {
                  year
                  month
                  day
                }
                format
                episodes
                duration
                status
                genres
                studios {
                  nodes {
                    name
                  }
                }
                averageScore
                popularity
              }
            }
          }
        `;

        return this.query<AniListSearchResponse>(query, { search, page, perPage });
      },
      cacheService.getTTL().MEDIUM
    );
  }

  /**
   * Get anime details by ID
   */
  async getAnimeDetails(animeId: number): Promise<AniListAnime> {
    const cacheKey = cacheService.keys.anilistAnime(animeId);

    return cacheService.getOrFetch(
      cacheKey,
      async () => {
        const query = `
          query ($id: Int) {
            Media(id: $id, type: ANIME) {
              id
              title {
                romaji
                english
                native
              }
              description
              coverImage {
                large
                medium
              }
              bannerImage
              startDate {
                year
                month
                day
              }
              endDate {
                year
                month
                day
              }
              format
              episodes
              duration
              status
              genres
              studios {
                nodes {
                  name
                }
              }
              averageScore
              popularity
            }
          }
        `;

        const response = await this.query<{ Media: AniListAnime }>(query, { id: animeId });
        return response.Media;
      },
      cacheService.getTTL().LONG
    );
  }

  /**
   * Get trending anime
   */
  async getTrendingAnime(page: number = 1, perPage: number = 20): Promise<AniListSearchResponse> {
    const cacheKey = cacheService.keys.anilistTrending(page);

    return cacheService.getOrFetch(
      cacheKey,
      async () => {
        const query = `
          query ($page: Int, $perPage: Int) {
            Page(page: $page, perPage: $perPage) {
              pageInfo {
                total
                currentPage
                lastPage
                hasNextPage
                perPage
              }
              media(type: ANIME, sort: TRENDING_DESC) {
                id
                title {
                  romaji
                  english
                  native
                }
                description
                coverImage {
                  large
                  medium
                }
                bannerImage
                startDate {
                  year
                  month
                  day
                }
                endDate {
                  year
                  month
                  day
                }
                format
                episodes
                duration
                status
                genres
                studios {
                  nodes {
                    name
                  }
                }
                averageScore
                popularity
              }
            }
          }
        `;

        return this.query<AniListSearchResponse>(query, { page, perPage });
      },
      cacheService.getTTL().SHORT
    );
  }

  /**
   * Get popular anime
   */
  async getPopularAnime(page: number = 1, perPage: number = 20): Promise<AniListSearchResponse> {
    const cacheKey = cacheService.keys.anilistPopular(page);

    return cacheService.getOrFetch(
      cacheKey,
      async () => {
        const query = `
          query ($page: Int, $perPage: Int) {
            Page(page: $page, perPage: $perPage) {
              pageInfo {
                total
                currentPage
                lastPage
                hasNextPage
                perPage
              }
              media(type: ANIME, sort: POPULARITY_DESC) {
                id
                title {
                  romaji
                  english
                  native
                }
                description
                coverImage {
                  large
                  medium
                }
                bannerImage
                startDate {
                  year
                  month
                  day
                }
                endDate {
                  year
                  month
                  day
                }
                format
                episodes
                duration
                status
                genres
                studios {
                  nodes {
                    name
                  }
                }
                averageScore
                popularity
              }
            }
          }
        `;

        return this.query<AniListSearchResponse>(query, { page, perPage });
      },
      cacheService.getTTL().SHORT
    );
  }

  /**
   * Search anime by genre
   */
  async searchByGenre(genre: string, page: number = 1, perPage: number = 20): Promise<AniListSearchResponse> {
    const cacheKey = cacheService.keys.anilistGenre(genre, page);

    return cacheService.getOrFetch(
      cacheKey,
      async () => {
        const query = `
          query ($genre: String, $page: Int, $perPage: Int) {
            Page(page: $page, perPage: $perPage) {
              pageInfo {
                total
                currentPage
                lastPage
                hasNextPage
                perPage
              }
              media(type: ANIME, genre: $genre) {
                id
                title {
                  romaji
                  english
                  native
                }
                description
                coverImage {
                  large
                  medium
                }
                bannerImage
                startDate {
                  year
                  month
                  day
                }
                endDate {
                  year
                  month
                  day
                }
                format
                episodes
                duration
                status
                genres
                studios {
                  nodes {
                    name
                  }
                }
                averageScore
                popularity
              }
            }
          }
        `;

        return this.query<AniListSearchResponse>(query, { genre, page, perPage });
      },
      cacheService.getTTL().MEDIUM
    );
  }
}

export const anilistService = new AniListService();
