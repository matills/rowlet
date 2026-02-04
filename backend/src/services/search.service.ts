import { getTMDBClient } from '../integrations/tmdb/index.js';
import { getAniListClient } from '../integrations/anilist/index.js';
import type { OwlistContent } from '../integrations/tmdb/types.js';
import type { OwlistAnimeContent } from '../integrations/anilist/types.js';

export type UnifiedContent = OwlistContent | OwlistAnimeContent;
export type ContentType = 'all' | 'movie' | 'series' | 'anime';

export interface SearchOptions {
  query: string;
  type?: ContentType;
  page?: number;
}

export class SearchService {
  /**
   * Unified search across TMDB and AniList
   */
  async search(options: SearchOptions): Promise<UnifiedContent[]> {
    const { query, type = 'all', page = 1 } = options;

    if (!query || query.trim().length === 0) {
      return [];
    }

    try {
      const results: UnifiedContent[] = [];

      // Search based on type filter
      if (type === 'all') {
        // Search all sources in parallel
        const [tmdbResults, aniListResults] = await Promise.all([
          this.searchTMDB(query, page),
          this.searchAniList(query, page),
        ]);
        results.push(...tmdbResults, ...aniListResults);
      } else if (type === 'anime') {
        // Only search AniList for anime
        const aniListResults = await this.searchAniList(query, page);
        results.push(...aniListResults);
      } else if (type === 'movie') {
        // Only search TMDB for movies
        const tmdbClient = getTMDBClient();
        const movieResults = await tmdbClient.searchMovies(query, page);
        results.push(...movieResults);
      } else if (type === 'series') {
        // Only search TMDB for series
        const tmdbClient = getTMDBClient();
        const seriesResults = await tmdbClient.searchSeries(query, page);
        results.push(...seriesResults);
      }

      return results;
    } catch (error) {
      console.error('Search error:', error);
      throw new Error('Failed to search content');
    }
  }

  /**
   * Search TMDB (movies and series)
   */
  private async searchTMDB(query: string, page: number): Promise<OwlistContent[]> {
    try {
      const tmdbClient = getTMDBClient();
      return await tmdbClient.search(query, page);
    } catch (error) {
      console.error('TMDB search failed:', error);
      return [];
    }
  }

  /**
   * Search AniList (anime)
   */
  private async searchAniList(query: string, page: number): Promise<OwlistAnimeContent[]> {
    try {
      const aniListClient = getAniListClient();
      return await aniListClient.search(query, page);
    } catch (error) {
      console.error('AniList search failed:', error);
      return [];
    }
  }

  /**
   * Get content details by source and external ID
   */
  async getContentDetails(source: 'tmdb' | 'anilist', externalId: string, type?: 'movie' | 'series' | 'anime'): Promise<UnifiedContent> {
    try {
      if (source === 'tmdb') {
        const tmdbClient = getTMDBClient();
        const id = parseInt(externalId, 10);

        if (type === 'movie') {
          return await tmdbClient.getMovie(id);
        } else if (type === 'series') {
          return await tmdbClient.getSeries(id);
        } else {
          // Try movie first, then series
          try {
            return await tmdbClient.getMovie(id);
          } catch {
            return await tmdbClient.getSeries(id);
          }
        }
      } else {
        // AniList
        const aniListClient = getAniListClient();
        const id = parseInt(externalId, 10);
        return await aniListClient.getAnime(id);
      }
    } catch (error) {
      console.error('Get content details error:', error);
      throw new Error('Failed to get content details');
    }
  }
}

// Singleton instance
let searchService: SearchService | null = null;

export function getSearchService(): SearchService {
  if (!searchService) {
    searchService = new SearchService();
  }
  return searchService;
}
