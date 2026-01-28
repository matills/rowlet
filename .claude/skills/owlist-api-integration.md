---
name: owlist-api-integration
description: >
  Integration patterns for TMDB and AniList APIs. Covers API clients, data normalization,
  caching strategies, and error handling.
  Trigger: When working with external content APIs (TMDB for movies/series, AniList for anime).
license: MIT
metadata:
  author: owlist
  version: "1.0"
  scope: [root, backend]
  auto_invoke:
    - "Integrating TMDB or AniList APIs"
    - "Normalizing content data"
    - "Content search implementation"
    - "External API error handling"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, WebFetch
---

## API Overview

| API | Content | Auth | Rate Limit |
|-----|---------|------|------------|
| TMDB | Movies, TV Series | API Key (header) | 40 req/10s |
| AniList | Anime, Manga | None (public) | 90 req/min |

## TMDB Integration

### Setup

```typescript
// backend/src/integrations/tmdb/client.ts
import axios, { AxiosInstance } from 'axios';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

class TMDBClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: TMDB_BASE_URL,
      headers: {
        Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    // Rate limiting
    this.client.interceptors.request.use(async (config) => {
      await this.rateLimiter.acquire();
      return config;
    });
  }

  private rateLimiter = {
    tokens: 40,
    lastRefill: Date.now(),
    async acquire() {
      const now = Date.now();
      const elapsed = now - this.lastRefill;
      if (elapsed > 10000) {
        this.tokens = 40;
        this.lastRefill = now;
      }
      if (this.tokens <= 0) {
        await new Promise(r => setTimeout(r, 10000 - elapsed));
        this.tokens = 40;
        this.lastRefill = Date.now();
      }
      this.tokens--;
    },
  };

  // Search movies and TV
  async search(query: string, page = 1): Promise<TMDBSearchResult> {
    const { data } = await this.client.get('/search/multi', {
      params: {
        query,
        page,
        include_adult: false,
        language: 'es-ES', // or 'en-US'
      },
    });
    return data;
  }

  // Get movie details
  async getMovie(id: number): Promise<TMDBMovie> {
    const { data } = await this.client.get(`/movie/${id}`, {
      params: {
        append_to_response: 'credits,videos,images',
        language: 'es-ES',
      },
    });
    return data;
  }

  // Get TV series details
  async getTVShow(id: number): Promise<TMDBTVShow> {
    const { data } = await this.client.get(`/tv/${id}`, {
      params: {
        append_to_response: 'credits,videos,images',
        language: 'es-ES',
      },
    });
    return data;
  }

  // Helper: Get image URL
  static getImageUrl(path: string | null, size: 'w185' | 'w342' | 'w500' | 'original' = 'w342'): string | null {
    if (!path) return null;
    return `${TMDB_IMAGE_BASE}/${size}${path}`;
  }
}

export const tmdbClient = new TMDBClient();
```

### TMDB Types

```typescript
// backend/src/integrations/tmdb/types.ts

interface TMDBSearchResult {
  page: number;
  total_pages: number;
  total_results: number;
  results: (TMDBMovieResult | TMDBTVResult)[];
}

interface TMDBMovieResult {
  id: number;
  media_type: 'movie';
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
}

interface TMDBTVResult {
  id: number;
  media_type: 'tv';
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  genre_ids: number[];
}

interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  runtime: number;
  vote_average: number;
  genres: { id: number; name: string }[];
  credits: {
    cast: { id: number; name: string; character: string; profile_path: string | null }[];
    crew: { id: number; name: string; job: string }[];
  };
}

interface TMDBTVShow {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  last_air_date: string;
  number_of_episodes: number;
  number_of_seasons: number;
  status: string;
  vote_average: number;
  genres: { id: number; name: string }[];
  credits: {
    cast: { id: number; name: string; character: string; profile_path: string | null }[];
  };
}
```

## AniList Integration

### Setup

```typescript
// backend/src/integrations/anilist/client.ts
import axios from 'axios';

const ANILIST_URL = 'https://graphql.anilist.co';

class AniListClient {
  private async query<T>(query: string, variables: Record<string, unknown>): Promise<T> {
    const { data } = await axios.post(
      ANILIST_URL,
      { query, variables },
      { headers: { 'Content-Type': 'application/json' } }
    );
    return data.data;
  }

  async search(query: string, page = 1, perPage = 20): Promise<AniListSearchResult> {
    const graphqlQuery = `
      query ($search: String, $page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            total
            currentPage
            lastPage
            hasNextPage
          }
          media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
            id
            title {
              romaji
              english
              native
            }
            description(asHtml: false)
            coverImage {
              large
              extraLarge
            }
            bannerImage
            startDate {
              year
              month
              day
            }
            episodes
            status
            averageScore
            genres
            format
          }
        }
      }
    `;

    return this.query<AniListSearchResult>(graphqlQuery, {
      search: query,
      page,
      perPage,
    });
  }

  async getAnime(id: number): Promise<AniListAnime> {
    const graphqlQuery = `
      query ($id: Int) {
        Media(id: $id, type: ANIME) {
          id
          title {
            romaji
            english
            native
          }
          description(asHtml: false)
          coverImage {
            large
            extraLarge
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
          episodes
          duration
          status
          season
          seasonYear
          averageScore
          popularity
          genres
          studios(isMain: true) {
            nodes {
              id
              name
            }
          }
          format
          source
          characters(sort: ROLE, page: 1, perPage: 10) {
            nodes {
              id
              name {
                full
              }
              image {
                medium
              }
            }
          }
        }
      }
    `;

    const result = await this.query<{ Media: AniListAnime }>(graphqlQuery, { id });
    return result.Media;
  }
}

export const anilistClient = new AniListClient();
```

### AniList Types

```typescript
// backend/src/integrations/anilist/types.ts

interface AniListSearchResult {
  Page: {
    pageInfo: {
      total: number;
      currentPage: number;
      lastPage: number;
      hasNextPage: boolean;
    };
    media: AniListMediaPreview[];
  };
}

interface AniListMediaPreview {
  id: number;
  title: {
    romaji: string;
    english: string | null;
    native: string;
  };
  description: string | null;
  coverImage: {
    large: string;
    extraLarge: string;
  };
  bannerImage: string | null;
  startDate: { year: number; month: number; day: number } | null;
  episodes: number | null;
  status: 'FINISHED' | 'RELEASING' | 'NOT_YET_RELEASED' | 'CANCELLED' | 'HIATUS';
  averageScore: number | null;
  genres: string[];
  format: 'TV' | 'TV_SHORT' | 'MOVIE' | 'SPECIAL' | 'OVA' | 'ONA' | 'MUSIC';
}

interface AniListAnime extends AniListMediaPreview {
  endDate: { year: number; month: number; day: number } | null;
  duration: number | null;
  season: 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL' | null;
  seasonYear: number | null;
  popularity: number;
  studios: { nodes: { id: number; name: string }[] };
  source: string | null;
  characters: {
    nodes: {
      id: number;
      name: { full: string };
      image: { medium: string };
    }[];
  };
}
```

## Unified Content Model

### Normalization

```typescript
// backend/src/integrations/normalizer.ts
import type { Content } from '@/types/content';
import { TMDBClient } from './tmdb/client';

export function normalizeFromTMDB(
  item: TMDBMovie | TMDBTVShow | TMDBMovieResult | TMDBTVResult,
  type: 'movie' | 'series'
): Omit<Content, 'id'> {
  const isMovie = type === 'movie';
  const isDetailed = 'genres' in item && Array.isArray(item.genres) && typeof item.genres[0] === 'object';

  return {
    externalId: String(item.id),
    source: 'tmdb',
    type,
    title: isMovie ? (item as any).title : (item as any).name,
    originalTitle: isMovie ? (item as any).original_title : (item as any).original_name,
    year: extractYear(isMovie ? (item as any).release_date : (item as any).first_air_date),
    posterUrl: TMDBClient.getImageUrl((item as any).poster_path, 'w342'),
    backdropUrl: TMDBClient.getImageUrl((item as any).backdrop_path, 'w500'),
    overview: item.overview,
    genres: isDetailed
      ? (item as any).genres.map((g: any) => g.name)
      : [], // Genre IDs need separate mapping
    rating: item.vote_average,
    episodeCount: !isMovie ? (item as any).number_of_episodes : undefined,
    seasonCount: !isMovie ? (item as any).number_of_seasons : undefined,
    status: !isMovie ? mapTMDBStatus((item as any).status) : undefined,
    rawData: item,
  };
}

export function normalizeFromAniList(item: AniListAnime | AniListMediaPreview): Omit<Content, 'id'> {
  return {
    externalId: String(item.id),
    source: 'anilist',
    type: 'anime',
    title: item.title.english || item.title.romaji,
    originalTitle: item.title.native,
    year: item.startDate?.year ?? null,
    posterUrl: item.coverImage.extraLarge || item.coverImage.large,
    backdropUrl: item.bannerImage,
    overview: item.description?.replace(/<[^>]*>/g, '') || null, // Strip HTML
    genres: item.genres,
    rating: item.averageScore ? item.averageScore / 10 : null, // Convert to 1-10 scale
    episodeCount: item.episodes,
    seasonCount: undefined, // Anime doesn't typically have seasons like TV
    status: mapAniListStatus(item.status),
    rawData: item,
  };
}

function extractYear(dateString: string | null): number | null {
  if (!dateString) return null;
  const year = parseInt(dateString.split('-')[0], 10);
  return isNaN(year) ? null : year;
}

function mapTMDBStatus(status: string): 'ongoing' | 'ended' | 'upcoming' | null {
  const map: Record<string, 'ongoing' | 'ended' | 'upcoming'> = {
    'Returning Series': 'ongoing',
    'Ended': 'ended',
    'Canceled': 'ended',
    'In Production': 'upcoming',
    'Planned': 'upcoming',
  };
  return map[status] || null;
}

function mapAniListStatus(status: string): 'ongoing' | 'ended' | 'upcoming' | null {
  const map: Record<string, 'ongoing' | 'ended' | 'upcoming'> = {
    'FINISHED': 'ended',
    'RELEASING': 'ongoing',
    'NOT_YET_RELEASED': 'upcoming',
    'CANCELLED': 'ended',
    'HIATUS': 'ongoing',
  };
  return map[status] || null;
}
```

## Unified Search Service

```typescript
// backend/src/services/content.service.ts
import { tmdbClient } from '@/integrations/tmdb/client';
import { anilistClient } from '@/integrations/anilist/client';
import { normalizeFromTMDB, normalizeFromAniList } from '@/integrations/normalizer';
import { supabase } from '@/lib/supabase';
import type { Content, ContentType } from '@/types/content';

interface SearchOptions {
  query: string;
  types?: ContentType[];
  page?: number;
}

interface SearchResult {
  results: Content[];
  page: number;
  totalPages: number;
  totalResults: number;
}

export async function searchContent(options: SearchOptions): Promise<SearchResult> {
  const { query, types = ['movie', 'series', 'anime'], page = 1 } = options;
  
  const promises: Promise<any>[] = [];

  // Search TMDB for movies and series
  if (types.includes('movie') || types.includes('series')) {
    promises.push(
      tmdbClient.search(query, page).then(result => ({
        source: 'tmdb',
        data: result,
      }))
    );
  }

  // Search AniList for anime
  if (types.includes('anime')) {
    promises.push(
      anilistClient.search(query, page).then(result => ({
        source: 'anilist',
        data: result,
      }))
    );
  }

  const responses = await Promise.allSettled(promises);
  
  const results: Content[] = [];
  let totalResults = 0;

  for (const response of responses) {
    if (response.status !== 'fulfilled') continue;

    const { source, data } = response.value;

    if (source === 'tmdb') {
      totalResults += data.total_results;
      for (const item of data.results) {
        if (item.media_type === 'movie' && types.includes('movie')) {
          results.push(normalizeFromTMDB(item, 'movie') as Content);
        } else if (item.media_type === 'tv' && types.includes('series')) {
          results.push(normalizeFromTMDB(item, 'series') as Content);
        }
      }
    } else if (source === 'anilist') {
      totalResults += data.Page.pageInfo.total;
      for (const item of data.Page.media) {
        results.push(normalizeFromAniList(item) as Content);
      }
    }
  }

  // Cache results in Supabase
  await cacheContent(results);

  return {
    results,
    page,
    totalPages: Math.ceil(totalResults / 20),
    totalResults,
  };
}

async function cacheContent(items: Omit<Content, 'id'>[]): Promise<void> {
  if (items.length === 0) return;

  const { error } = await supabase.from('content').upsert(
    items.map(item => ({
      external_id: item.externalId,
      source: item.source,
      type: item.type,
      title: item.title,
      original_title: item.originalTitle,
      year: item.year,
      poster_url: item.posterUrl,
      backdrop_url: item.backdropUrl,
      overview: item.overview,
      genres: item.genres,
      rating: item.rating,
      episode_count: item.episodeCount,
      season_count: item.seasonCount,
      status: item.status,
      raw_data: item.rawData,
    })),
    { onConflict: 'external_id,source' }
  );

  if (error) {
    console.error('Failed to cache content:', error);
  }
}
```

## Error Handling

```typescript
// backend/src/integrations/errors.ts

export class ExternalAPIError extends Error {
  constructor(
    public source: 'tmdb' | 'anilist',
    public statusCode: number,
    message: string
  ) {
    super(`[${source.toUpperCase()}] ${message}`);
    this.name = 'ExternalAPIError';
  }
}

// Usage in clients
try {
  const result = await tmdbClient.search(query);
} catch (error) {
  if (axios.isAxiosError(error)) {
    throw new ExternalAPIError(
      'tmdb',
      error.response?.status || 500,
      error.response?.data?.status_message || 'Unknown error'
    );
  }
  throw error;
}
```

## Caching Strategy

1. **Search results:** Cache normalized content in Supabase on each search
2. **Details:** Fetch fresh on detail view, update cache
3. **TTL:** Content data is valid for ~24 hours
4. **Background refresh:** Edge function to update popular content nightly

```typescript
// Check cache first
const { data: cached } = await supabase
  .from('content')
  .select('*')
  .eq('external_id', externalId)
  .eq('source', source)
  .single();

// If fresh enough, return cached
if (cached && isFresh(cached.updated_at, 24 * 60 * 60 * 1000)) {
  return cached;
}

// Otherwise fetch fresh and update cache
const fresh = await fetchFromAPI(externalId, source);
await supabase.from('content').upsert(fresh, { onConflict: 'external_id,source' });
return fresh;
```

## Environment Variables

```bash
# TMDB
TMDB_API_KEY=your_tmdb_api_key

# AniList (no key needed for public API)
# ANILIST_CLIENT_ID=optional_for_user_features
```

## Resources

- [TMDB API Docs](https://developer.themoviedb.org/docs)
- [AniList API Docs](https://anilist.gitbook.io/anilist-apiv2-docs)
- [TMDB Image Configuration](https://developer.themoviedb.org/docs/image-basics)