import axios from 'axios'
import type { JikanAnime, JikanSearchResult, Content, Genre } from '../types/index.js'

const JIKAN_BASE_URL = 'https://api.jikan.moe/v4'

const jikanClient = axios.create({
  baseURL: JIKAN_BASE_URL,
})

// Rate limiting - Jikan allows 3 requests per second
let lastRequestTime = 0
const MIN_REQUEST_INTERVAL = 350 // ms

async function rateLimitedRequest<T>(request: () => Promise<T>): Promise<T> {
  const now = Date.now()
  const timeSinceLastRequest = now - lastRequestTime

  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest))
  }

  lastRequestTime = Date.now()
  return request()
}

function mapJikanGenres(genres: Array<{ mal_id: number; name: string }>): Genre[] {
  return genres.map(g => ({
    id: g.mal_id,
    name: g.name,
  }))
}

export function mapJikanAnimeToContent(anime: JikanAnime): Content {
  return {
    id: `anime-${anime.mal_id}`,
    externalId: String(anime.mal_id),
    type: 'anime',
    title: anime.title_english || anime.title,
    originalTitle: anime.title,
    posterPath: anime.images.jpg.large_image_url,
    backdropPath: anime.images.jpg.large_image_url,
    overview: anime.synopsis,
    releaseDate: anime.aired.from,
    genres: mapJikanGenres(anime.genres),
    rating: anime.score,
    voteCount: anime.scored_by,
    episodeCount: anime.episodes || undefined,
    status: anime.status,
  }
}

export const jikanService = {
  async searchAnime(query: string, page = 1) {
    return rateLimitedRequest(async () => {
      const { data } = await jikanClient.get<JikanSearchResult>('/anime', {
        params: { q: query, page, limit: 20 },
      })
      return {
        data: data.data.map(mapJikanAnimeToContent),
        page,
        totalPages: data.pagination.last_visible_page,
        totalResults: data.pagination.items.total,
      }
    })
  },

  async getAnimeById(id: string) {
    return rateLimitedRequest(async () => {
      const { data } = await jikanClient.get<{ data: JikanAnime }>(`/anime/${id}`)
      return mapJikanAnimeToContent(data.data)
    })
  },

  async getTopAnime(page = 1) {
    return rateLimitedRequest(async () => {
      const { data } = await jikanClient.get<JikanSearchResult>('/top/anime', {
        params: { page, limit: 20 },
      })
      return {
        data: data.data.map(mapJikanAnimeToContent),
        page,
        totalPages: data.pagination.last_visible_page,
        totalResults: data.pagination.items.total,
      }
    })
  },

  async getSeasonalAnime(year?: number, season?: string, page = 1) {
    return rateLimitedRequest(async () => {
      const currentYear = new Date().getFullYear()
      const currentSeason = getCurrentSeason()

      const { data } = await jikanClient.get<JikanSearchResult>(
        `/seasons/${year || currentYear}/${season || currentSeason}`,
        { params: { page, limit: 20 } }
      )
      return {
        data: data.data.map(mapJikanAnimeToContent),
        page,
        totalPages: data.pagination.last_visible_page,
        totalResults: data.pagination.items.total,
      }
    })
  },

  async getAnimeByGenre(genreId: number, page = 1) {
    return rateLimitedRequest(async () => {
      const { data } = await jikanClient.get<JikanSearchResult>('/anime', {
        params: { genres: genreId, page, limit: 20, order_by: 'score', sort: 'desc' },
      })
      return {
        data: data.data.map(mapJikanAnimeToContent),
        page,
        totalPages: data.pagination.last_visible_page,
        totalResults: data.pagination.items.total,
      }
    })
  },
}

function getCurrentSeason(): string {
  const month = new Date().getMonth()
  if (month >= 0 && month <= 2) return 'winter'
  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 8) return 'summer'
  return 'fall'
}
