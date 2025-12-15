import { api } from './api'
import type { Content } from '@/types'

export interface LikeResponse {
  liked: boolean
  data?: any
}

export const likeService = {
  // Get all user's liked content
  async getLikes(): Promise<any[]> {
    const { data } = await api.get('/user/likes')
    return data
  },

  // Toggle like on content
  async toggleLike(content: {
    externalId: string
    type: 'movie' | 'tv' | 'anime'
    title: string
    posterPath?: string
  }): Promise<LikeResponse> {
    const { data } = await api.post<LikeResponse>('/user/likes', {
      externalId: content.externalId,
      type: content.type,
      title: content.title,
      posterPath: content.posterPath,
    })
    return data
  },

  // Check if content is liked
  async checkLike(externalId: string, type: string): Promise<boolean> {
    const { data } = await api.get<{ liked: boolean }>(
      `/user/likes/check/${externalId}/${type}`
    )
    return data.liked
  },
}
