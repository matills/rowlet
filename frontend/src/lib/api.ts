// API client for backend endpoints

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface SearchParams {
  query: string;
  type?: 'all' | 'movie' | 'series' | 'anime';
  page?: number;
}

export interface ContentItem {
  externalId: string;
  source: 'tmdb' | 'anilist';
  type: 'movie' | 'series' | 'anime';
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
}

export interface SearchResponse {
  query: string;
  type: string;
  page: number;
  results: ContentItem[];
  count: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: 'An error occurred',
      }));
      throw new Error(error.error || 'API request failed');
    }

    return response.json();
  }

  async search(params: SearchParams): Promise<SearchResponse> {
    const queryParams = new URLSearchParams({
      q: params.query,
      ...(params.type && { type: params.type }),
      ...(params.page && { page: params.page.toString() }),
    });

    return this.fetch<SearchResponse>(`/api/search?${queryParams}`);
  }

  async getContentDetails(
    source: 'tmdb' | 'anilist',
    externalId: string,
    type?: 'movie' | 'series' | 'anime'
  ): Promise<ContentItem> {
    const queryParams = type ? `?type=${type}` : '';
    return this.fetch<ContentItem>(`/api/search/${source}/${externalId}${queryParams}`);
  }

  // Helper to get auth header from Supabase
  private getAuthHeader(token: string): HeadersInit {
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  async addToLibrary(
    token: string,
    data: {
      externalId: string;
      source: 'tmdb' | 'anilist';
      type: 'movie' | 'series' | 'anime';
      status: 'watched' | 'watching' | 'want_to_watch' | 'dropped' | 'paused';
      rating?: number;
      episodesWatched?: number;
      watchedAt?: string;
      notes?: string;
    }
  ): Promise<any> {
    return this.fetch('/api/content', {
      method: 'POST',
      headers: this.getAuthHeader(token),
      body: JSON.stringify(data),
    });
  }

  async getUserContent(
    token: string,
    status?: 'watched' | 'watching' | 'want_to_watch' | 'dropped' | 'paused'
  ): Promise<any> {
    const queryParams = status ? `?status=${status}` : '';
    return this.fetch(`/api/content${queryParams}`, {
      headers: this.getAuthHeader(token),
    });
  }

  async updateUserContent(
    token: string,
    userContentId: string,
    data: {
      status?: 'watched' | 'watching' | 'want_to_watch' | 'dropped' | 'paused';
      rating?: number;
      episodesWatched?: number;
      watchedAt?: string;
      notes?: string;
    }
  ): Promise<any> {
    return this.fetch(`/api/content/${userContentId}`, {
      method: 'PUT',
      headers: this.getAuthHeader(token),
      body: JSON.stringify(data),
    });
  }

  async deleteUserContent(token: string, userContentId: string): Promise<void> {
    return this.fetch(`/api/content/${userContentId}`, {
      method: 'DELETE',
      headers: this.getAuthHeader(token),
    });
  }
}

export const api = new ApiClient(API_URL);
