import { Router } from 'express'
import { z } from 'zod'
import { tmdbService } from '../services/tmdb.js'
import { jikanService } from '../services/jikan.js'
import type { ContentType, Content, PaginatedResponse } from '../types/index.js'

export const contentRouter = Router()

const searchSchema = z.object({
  query: z.string().min(1),
  type: z.enum(['movie', 'tv', 'anime']).optional(),
  page: z.coerce.number().min(1).default(1),
})

// Search content
contentRouter.get('/search', async (req, res, next) => {
  try {
    const { query, type, page } = searchSchema.parse(req.query)

    let results: PaginatedResponse<Content>

    if (type === 'movie') {
      results = await tmdbService.searchMovies(query, page)
    } else if (type === 'tv') {
      results = await tmdbService.searchTV(query, page)
    } else if (type === 'anime') {
      results = await jikanService.searchAnime(query, page)
    } else {
      // Search all types
      const [movies, tvShows, anime] = await Promise.all([
        tmdbService.searchMovies(query, page),
        tmdbService.searchTV(query, page),
        jikanService.searchAnime(query, page),
      ])

      // Deduplicate content by normalizing titles
      const seenTitles = new Set<string>()
      const allContent: Content[] = []

      const normalizeTitle = (title: string) =>
        title.toLowerCase().replace(/[^a-z0-9]/g, '')

      // Add all content while checking for duplicates
      for (const item of [...movies.data, ...tvShows.data, ...anime.data]) {
        const normalizedTitle = normalizeTitle(item.title)
        if (!seenTitles.has(normalizedTitle)) {
          seenTitles.add(normalizedTitle)
          allContent.push(item)
        }
      }

      allContent.sort((a, b) => (b.rating || 0) - (a.rating || 0))

      results = {
        data: allContent,
        page,
        totalPages: Math.max(movies.totalPages, tvShows.totalPages, anime.totalPages),
        totalResults: allContent.length,
      }
    }

    res.json(results)
  } catch (error) {
    next(error)
  }
})

// Get content by type and ID
contentRouter.get('/:type/:id', async (req, res, next) => {
  try {
    const { type, id } = req.params

    let content: Content

    switch (type) {
      case 'movie':
        content = await tmdbService.getMovieById(id)
        break
      case 'tv':
        content = await tmdbService.getTVById(id)
        break
      case 'anime':
        content = await jikanService.getAnimeById(id)
        break
      default:
        return res.status(400).json({ error: 'Invalid content type' })
    }

    res.json(content)
  } catch (error) {
    next(error)
  }
})

// Get trending content
contentRouter.get('/trending', async (req, res, next) => {
  try {
    const { type, page = 1 } = req.query

    if (type === 'movie') {
      const results = await tmdbService.getTrendingMovies(Number(page))
      return res.json(results)
    }

    if (type === 'tv') {
      const results = await tmdbService.getTrendingTV(Number(page))
      return res.json(results)
    }

    if (type === 'anime') {
      const results = await jikanService.getTopAnime(Number(page))
      return res.json(results)
    }

    // Return all trending with deduplication
    const [movies, tvShows, anime] = await Promise.all([
      tmdbService.getTrendingMovies(Number(page)),
      tmdbService.getTrendingTV(Number(page)),
      jikanService.getTopAnime(Number(page)),
    ])

    // Deduplicate trending content
    const seenTitles = new Set<string>()
    const trendingContent: Content[] = []

    const normalizeTitle = (title: string) =>
      title.toLowerCase().replace(/[^a-z0-9]/g, '')

    for (const item of [
      ...movies.data.slice(0, 6),
      ...tvShows.data.slice(0, 6),
      ...anime.data.slice(0, 6),
    ]) {
      const normalizedTitle = normalizeTitle(item.title)
      if (!seenTitles.has(normalizedTitle)) {
        seenTitles.add(normalizedTitle)
        trendingContent.push(item)
      }
    }

    res.json({
      data: trendingContent,
      page: Number(page),
      totalPages: Math.max(movies.totalPages, tvShows.totalPages, anime.totalPages),
      totalResults: trendingContent.length,
    })
  } catch (error) {
    next(error)
  }
})

// Get content by genre
contentRouter.get('/genre', async (req, res, next) => {
  try {
    const { genreId, type, page = 1 } = req.query

    if (!genreId) {
      return res.status(400).json({ error: 'genreId is required' })
    }

    const genreIdNum = Number(genreId)

    if (type === 'anime') {
      const results = await jikanService.getAnimeByGenre(genreIdNum, Number(page))
      return res.json(results)
    }

    const contentType = (type as 'movie' | 'tv') || 'movie'
    const results = await tmdbService.discoverByGenre(genreIdNum, contentType, Number(page))
    res.json(results)
  } catch (error) {
    next(error)
  }
})
