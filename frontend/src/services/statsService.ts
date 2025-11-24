import { api } from './api'
import type { UserStats } from '@/types'

export const statsService = {
  async getUserStats(): Promise<UserStats> {
    const { data } = await api.get<UserStats>('/user/stats')
    return data
  },

  async getWrapped(year?: number): Promise<WrappedData> {
    const { data } = await api.get<WrappedData>('/user/wrapped', {
      params: { year },
    })
    return data
  },
}

export interface WrappedData {
  year: number
  totalHoursWatched: number
  totalContentWatched: number
  topGenres: Array<{ genre: string; count: number; percentage: number }>
  topActors: Array<{ name: string; count: number }>
  topDirectors: Array<{ name: string; count: number }>
  monthlyBreakdown: Array<{ month: string; hours: number; count: number }>
  longestBinge: {
    content: string
    episodes: number
    date: string
  }
  mostWatchedMonth: {
    month: string
    hours: number
  }
  contentByType: {
    movies: number
    tvShows: number
    anime: number
  }
  yearComparison?: {
    previousYear: number
    currentYear: number
    difference: number
    percentageChange: number
  }
}
