import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../config/prisma.js'
import { authenticate } from '../middlewares/auth.js'
import { AppError } from '../middlewares/errorHandler.js'
import type { AuthRequest, WatchStatus } from '../types/index.js'

export const userRouter = Router()

// Get user's content list
userRouter.get('/content', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { status } = req.query

    const userContent = await prisma.userContent.findMany({
      where: {
        userId: req.user!.userId,
        ...(status && { status: status as WatchStatus }),
      },
      include: {
        content: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    res.json(userContent)
  } catch (error) {
    next(error)
  }
})

// Add content to user's list
userRouter.post('/content', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const schema = z.object({
      externalId: z.string(),
      type: z.enum(['movie', 'tv', 'anime']),
      title: z.string(),
      posterPath: z.string().optional(),
      status: z.enum(['watching', 'completed', 'plan_to_watch', 'dropped', 'on_hold']),
    })

    const data = schema.parse(req.body)

    // First, ensure content exists in our database
    let content = await prisma.content.findFirst({
      where: {
        externalId: data.externalId,
        type: data.type,
      },
    })

    if (!content) {
      content = await prisma.content.create({
        data: {
          externalId: data.externalId,
          type: data.type,
          title: data.title,
          posterPath: data.posterPath,
        },
      })
    }

    // Check if user already has this content
    const existingUserContent = await prisma.userContent.findFirst({
      where: {
        userId: req.user!.userId,
        contentId: content.id,
      },
    })

    if (existingUserContent) {
      throw new AppError(400, 'El contenido ya está en tu lista')
    }

    // Add to user's list
    const userContent = await prisma.userContent.create({
      data: {
        userId: req.user!.userId,
        contentId: content.id,
        status: data.status,
      },
      include: {
        content: true,
      },
    })

    res.status(201).json(userContent)
  } catch (error) {
    next(error)
  }
})

// Update user content
userRouter.patch('/content/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params

    const schema = z.object({
      status: z.enum(['watching', 'completed', 'plan_to_watch', 'dropped', 'on_hold']).optional(),
      userRating: z.number().min(1).max(10).optional(),
      notes: z.string().max(1000).optional(),
      episodesWatched: z.number().min(0).optional(),
      seasonsWatched: z.number().min(0).optional(),
    })

    const data = schema.parse(req.body)

    const userContent = await prisma.userContent.findFirst({
      where: {
        id,
        userId: req.user!.userId,
      },
    })

    if (!userContent) {
      throw new AppError(404, 'Contenido no encontrado')
    }

    const updated = await prisma.userContent.update({
      where: { id },
      data: {
        ...data,
        ...(data.status === 'completed' && !userContent.endDate && { endDate: new Date() }),
        ...(data.status === 'watching' && !userContent.startDate && { startDate: new Date() }),
      },
      include: {
        content: true,
      },
    })

    res.json(updated)
  } catch (error) {
    next(error)
  }
})

// Remove content from user's list
userRouter.delete('/content/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params

    const userContent = await prisma.userContent.findFirst({
      where: {
        id,
        userId: req.user!.userId,
      },
    })

    if (!userContent) {
      throw new AppError(404, 'Contenido no encontrado')
    }

    await prisma.userContent.delete({
      where: { id },
    })

    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

// Get user stats
userRouter.get('/stats', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.userId

    const userContent = await prisma.userContent.findMany({
      where: { userId },
      include: { content: true },
    })

    const stats = {
      totalWatched: userContent.filter(c => c.status === 'completed').length,
      totalWatching: userContent.filter(c => c.status === 'watching').length,
      totalPlanToWatch: userContent.filter(c => c.status === 'plan_to_watch').length,
      totalHoursWatched: 0, // Would need runtime data
      movieCount: userContent.filter(c => c.content.type === 'movie').length,
      tvCount: userContent.filter(c => c.content.type === 'tv').length,
      animeCount: userContent.filter(c => c.content.type === 'anime').length,
      favoriteGenres: [], // Would aggregate from content genres
      monthlyActivity: [], // Would aggregate by month
    }

    res.json(stats)
  } catch (error) {
    next(error)
  }
})

// Get wrapped data
userRouter.get('/wrapped', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { year } = req.query
    const targetYear = year ? Number(year) : new Date().getFullYear()

    const userId = req.user!.userId

    const userContent = await prisma.userContent.findMany({
      where: {
        userId,
        status: 'completed',
        endDate: {
          gte: new Date(`${targetYear}-01-01`),
          lt: new Date(`${targetYear + 1}-01-01`),
        },
      },
      include: { content: true },
    })

    const wrapped = {
      year: targetYear,
      totalHoursWatched: 0,
      totalContentWatched: userContent.length,
      topGenres: [],
      topActors: [],
      topDirectors: [],
      monthlyBreakdown: [],
      longestBinge: null,
      mostWatchedMonth: null,
      contentByType: {
        movies: userContent.filter(c => c.content.type === 'movie').length,
        tvShows: userContent.filter(c => c.content.type === 'tv').length,
        anime: userContent.filter(c => c.content.type === 'anime').length,
      },
    }

    res.json(wrapped)
  } catch (error) {
    next(error)
  }
})
