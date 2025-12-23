import { redis } from '../config/redis';
import { logger } from '../config/logger';

/**
 * Cache service with common caching patterns
 */
export class CacheService {
  private readonly TTL = {
    SHORT: 60 * 5, // 5 minutes
    MEDIUM: 60 * 30, // 30 minutes
    LONG: 60 * 60 * 2, // 2 hours
    DAY: 60 * 60 * 24, // 24 hours
  };

  /**
   * Get or fetch pattern
   * If value exists in cache, return it. Otherwise, execute fetchFn and cache the result.
   */
  async getOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = this.TTL.MEDIUM
  ): Promise<T> {
    try {
      // Try to get from cache
      const cached = await redis.get<T>(key);
      if (cached !== null) {
        logger.debug(`Cache hit: ${key}`);
        return cached;
      }

      // Cache miss - fetch data
      logger.debug(`Cache miss: ${key}`);
      const data = await fetchFn();

      // Store in cache (fire and forget)
      redis.set(key, data, ttl).catch((err) => {
        logger.error(`Failed to cache ${key}:`, err);
      });

      return data;
    } catch (error) {
      logger.error(`Cache getOrFetch error for ${key}:`, error);
      // If cache fails, still try to fetch the data
      return fetchFn();
    }
  }

  /**
   * Invalidate cache by key
   */
  async invalidate(key: string): Promise<void> {
    try {
      await redis.del(key);
      logger.debug(`Cache invalidated: ${key}`);
    } catch (error) {
      logger.error(`Failed to invalidate cache ${key}:`, error);
    }
  }

  /**
   * Invalidate cache by pattern
   */
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const count = await redis.delPattern(pattern);
      logger.debug(`Cache invalidated ${count} keys matching: ${pattern}`);
    } catch (error) {
      logger.error(`Failed to invalidate cache pattern ${pattern}:`, error);
    }
  }

  /**
   * Cache keys for external APIs
   */
  keys = {
    // TMDB
    tmdbMovie: (id: number) => `tmdb:movie:${id}`,
    tmdbSeries: (id: number) => `tmdb:series:${id}`,
    tmdbSeason: (seriesId: number, seasonNumber: number) =>
      `tmdb:series:${seriesId}:season:${seasonNumber}`,
    tmdbSearchMovies: (query: string, page: number) =>
      `tmdb:search:movies:${query}:${page}`,
    tmdbSearchSeries: (query: string, page: number) =>
      `tmdb:search:series:${query}:${page}`,
    tmdbPopularMovies: (page: number) => `tmdb:popular:movies:${page}`,
    tmdbPopularSeries: (page: number) => `tmdb:popular:series:${page}`,
    tmdbTrending: (type: string, timeWindow: string, page: number) =>
      `tmdb:trending:${type}:${timeWindow}:${page}`,

    // AniList
    anilistAnime: (id: number) => `anilist:anime:${id}`,
    anilistSearch: (query: string, page: number) =>
      `anilist:search:${query}:${page}`,
    anilistTrending: (page: number) => `anilist:trending:${page}`,
    anilistPopular: (page: number) => `anilist:popular:${page}`,
    anilistGenre: (genre: string, page: number) =>
      `anilist:genre:${genre}:${page}`,

    // Media from DB
    media: (id: string) => `media:${id}`,
    mediaSearch: (params: string) => `media:search:${params}`,
  };

  /**
   * Get cache TTL values
   */
  getTTL() {
    return this.TTL;
  }
}

export const cacheService = new CacheService();
