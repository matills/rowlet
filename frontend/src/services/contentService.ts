import { api } from './api'
import type {
  Content,
  ContentType,
  PaginatedResponse,
  SearchFilters,
  UserContent,
  WatchStatus
} from '@/types'

export const contentService = {
  // Search content from external APIs (TMDB, Jikan)
  async search(filters: SearchFilters): Promise<PaginatedResponse<Content>> {
    const { data } = await api.get<PaginatedResponse<Content>>('/content/search', {
      params: filters,
    })
    return data
  },

  // Get content details
  async getById(type: ContentType, externalId: string): Promise<Content> {
    const { data } = await api.get<Content>(`/content/${type}/${externalId}`)
    return data
  },

  // Get trending content
  async getTrending(type?: ContentType): Promise<PaginatedResponse<Content>> {
    const { data } = await api.get<PaginatedResponse<Content>>('/content/trending', {
      params: { type },
    })
    return data
  },

  // Get popular content by genre
  async getByGenre(genreId: number, type?: ContentType): Promise<PaginatedResponse<Content>> {
    const { data } = await api.get<PaginatedResponse<Content>>('/content/genre', {
      params: { genreId, type },
    })
    return data
  },

  // User's content tracking
  async getUserContent(status?: WatchStatus): Promise<UserContent[]> {
    const { data } = await api.get<UserContent[]>('/user/content', {
      params: { status },
    })
    return data
  },

  async addToList(contentId: string, status: WatchStatus): Promise<UserContent> {
    const { data } = await api.post<UserContent>('/user/content', {
      contentId,
      status,
    })
    return data
  },

  async updateUserContent(
    userContentId: string,
    updates: Partial<Pick<UserContent, 'status' | 'userRating' | 'notes' | 'episodesWatched'>>
  ): Promise<UserContent> {
    const { data } = await api.patch<UserContent>(`/user/content/${userContentId}`, updates)
    return data
  },

  async removeFromList(userContentId: string): Promise<void> {
    await api.delete(`/user/content/${userContentId}`)
  },
}
