import axios, { AxiosInstance } from 'axios';
import type { AniListMedia, AniListSearchResponse, OwlistAnimeContent } from './types.js';
import { SEARCH_ANIME_QUERY, GET_ANIME_QUERY } from './queries.js';

const ANILIST_API_URL = 'https://graphql.anilist.co';

export class AniListClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: ANILIST_API_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 10000,
    });
  }

  /**
   * Search for anime
   */
  async search(query: string, page = 1, perPage = 20): Promise<OwlistAnimeContent[]> {
    try {
      const response = await this.client.post<AniListSearchResponse>('', {
        query: SEARCH_ANIME_QUERY,
        variables: {
          search: query,
          page,
          perPage,
        },
      });

      return response.data.data.Page.media.map((anime) => this.normalizeAnime(anime));
    } catch (error) {
      console.error('AniList search error:', error);
      throw new Error('Failed to search AniList');
    }
  }

  /**
   * Get anime details by ID
   */
  async getAnime(id: number): Promise<OwlistAnimeContent> {
    try {
      const response = await this.client.post<{ data: { Media: AniListMedia } }>('', {
        query: GET_ANIME_QUERY,
        variables: {
          id,
        },
      });

      return this.normalizeAnime(response.data.data.Media);
    } catch (error) {
      console.error('AniList get anime error:', error);
      throw new Error('Failed to get anime details');
    }
  }

  /**
   * Normalize AniList anime to Owlist content format
   */
  private normalizeAnime(anime: AniListMedia): OwlistAnimeContent {
    const title = anime.title.english || anime.title.romaji;
    const originalTitle = anime.title.native || anime.title.romaji;
    const year = anime.startDate.year || null;

    // Clean HTML from description
    const description = anime.description
      ? anime.description.replace(/<br>/g, '\n').replace(/<[^>]*>/g, '')
      : '';

    // Convert AniList score (0-100) to 0-10 scale
    const rating = anime.averageScore ? Number((anime.averageScore / 10).toFixed(1)) : null;

    // Map AniList status to simplified status
    let status: string | null = null;
    switch (anime.status) {
      case 'FINISHED':
        status = 'ended';
        break;
      case 'RELEASING':
        status = 'ongoing';
        break;
      case 'NOT_YET_RELEASED':
        status = 'upcoming';
        break;
      case 'CANCELLED':
      case 'HIATUS':
        status = anime.status.toLowerCase();
        break;
    }

    return {
      externalId: anime.id.toString(),
      source: 'anilist',
      type: 'anime',
      title,
      originalTitle,
      year,
      posterUrl: anime.coverImage.extraLarge || anime.coverImage.large || null,
      backdropUrl: anime.bannerImage || null,
      overview: description,
      genres: anime.genres || [],
      rating,
      episodeCount: anime.episodes || null,
      seasonCount: null, // AniList doesn't have explicit seasons
      status,
      rawData: anime,
    };
  }
}

// Singleton instance
let aniListClient: AniListClient | null = null;

export function getAniListClient(): AniListClient {
  if (!aniListClient) {
    aniListClient = new AniListClient();
  }
  return aniListClient;
}
