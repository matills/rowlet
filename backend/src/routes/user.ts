import { Router } from 'express'
import { z } from 'zod'
import { supabase } from '../config/supabase.js'
import { authenticate } from '../middlewares/auth.js'
import { AppError } from '../middlewares/errorHandler.js'
import type { AuthRequest, WatchStatus, DbUserContent, DbContent } from '../types/index.js'

export const userRouter = Router()

// Get user's content list
userRouter.get('/content', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { status } = req.query

    let query = supabase
      .from('user_content')
      .select(`
        *,
        content (*)
      `)
      .eq('user_id', req.user!.userId)
      .order('updated_at', { ascending: false })

    if (status) {
      query = query.eq('status', status as WatchStatus)
    }

    const { data: userContent, error } = await query

    if (error) {
      throw new AppError(500, 'Error al obtener el contenido')
    }

    res.json(userContent || [])
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
    const { data: existingContent } = await supabase
      .from('content')
      .select('*')
      .eq('external_id', data.externalId)
      .eq('type', data.type)
      .single<DbContent>()

    let content = existingContent

    if (!content) {
      const { data: newContent, error: createError } = await supabase
        .from('content')
        .insert({
          external_id: data.externalId,
          type: data.type,
          title: data.title,
          poster_path: data.posterPath,
        })
        .select()
        .single<DbContent>()

      if (createError || !newContent) {
        throw new AppError(500, 'Error al crear el contenido')
      }

      content = newContent
    }

    // Check if user already has this content
    const { data: existingUserContent } = await supabase
      .from('user_content')
      .select('id')
      .eq('user_id', req.user!.userId)
      .eq('content_id', content!.id)
      .single()

    if (existingUserContent) {
      throw new AppError(400, 'El contenido ya está en tu lista')
    }

    // Add to user's list
    const { data: userContent, error } = await supabase
      .from('user_content')
      .insert({
        user_id: req.user!.userId,
        content_id: content!.id,
        status: data.status,
      })
      .select(`
        *,
        content (*)
      `)
      .single()

    if (error || !userContent) {
      throw new AppError(500, 'Error al agregar el contenido')
    }

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

    // First, get existing user content
    const { data: existingUserContent } = await supabase
      .from('user_content')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user!.userId)
      .single<DbUserContent>()

    if (!existingUserContent) {
      throw new AppError(404, 'Contenido no encontrado')
    }

    // Build update data
    const updateData: Partial<DbUserContent> = {}
    if (data.status !== undefined) {
      updateData.status = data.status
      // Set end_date if completing
      if (data.status === 'completed' && !existingUserContent.end_date) {
        updateData.end_date = new Date().toISOString()
      }
      // Set start_date if starting to watch
      if (data.status === 'watching' && !existingUserContent.start_date) {
        updateData.start_date = new Date().toISOString()
      }
    }
    if (data.userRating !== undefined) updateData.user_rating = data.userRating
    if (data.notes !== undefined) updateData.notes = data.notes
    if (data.episodesWatched !== undefined) updateData.episodes_watched = data.episodesWatched
    if (data.seasonsWatched !== undefined) updateData.seasons_watched = data.seasonsWatched

    const { data: updated, error } = await supabase
      .from('user_content')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        content (*)
      `)
      .single()

    if (error || !updated) {
      throw new AppError(500, 'Error al actualizar el contenido')
    }

    res.json(updated)
  } catch (error) {
    next(error)
  }
})

// Remove content from user's list
userRouter.delete('/content/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params

    const { data: userContent } = await supabase
      .from('user_content')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.user!.userId)
      .single()

    if (!userContent) {
      throw new AppError(404, 'Contenido no encontrado')
    }

    const { error } = await supabase
      .from('user_content')
      .delete()
      .eq('id', id)

    if (error) {
      throw new AppError(500, 'Error al eliminar el contenido')
    }

    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

// Get user stats
userRouter.get('/stats', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.userId

    const { data: userContent, error } = await supabase
      .from('user_content')
      .select(`
        *,
        content (*)
      `)
      .eq('user_id', userId)

    if (error) {
      throw new AppError(500, 'Error al obtener las estadísticas')
    }

    const stats = {
      totalWatched: userContent?.filter(c => c.status === 'completed').length || 0,
      totalWatching: userContent?.filter(c => c.status === 'watching').length || 0,
      totalPlanToWatch: userContent?.filter(c => c.status === 'plan_to_watch').length || 0,
      totalHoursWatched: 0, // Would need runtime data
      movieCount: userContent?.filter((c: any) => c.content?.type === 'movie').length || 0,
      tvCount: userContent?.filter((c: any) => c.content?.type === 'tv').length || 0,
      animeCount: userContent?.filter((c: any) => c.content?.type === 'anime').length || 0,
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

    const { data: userContent, error } = await supabase
      .from('user_content')
      .select(`
        *,
        content (*)
      `)
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('end_date', `${targetYear}-01-01`)
      .lt('end_date', `${targetYear + 1}-01-01`)

    if (error) {
      throw new AppError(500, 'Error al obtener datos de wrapped')
    }

    const wrapped = {
      year: targetYear,
      totalHoursWatched: 0,
      totalContentWatched: userContent?.length || 0,
      topGenres: [],
      topActors: [],
      topDirectors: [],
      monthlyBreakdown: [],
      longestBinge: null,
      mostWatchedMonth: null,
      contentByType: {
        movies: userContent?.filter((c: any) => c.content?.type === 'movie').length || 0,
        tvShows: userContent?.filter((c: any) => c.content?.type === 'tv').length || 0,
        anime: userContent?.filter((c: any) => c.content?.type === 'anime').length || 0,
      },
    }

    res.json(wrapped)
  } catch (error) {
    next(error)
  }
})

// Get user's liked content
userRouter.get('/likes', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { data: likes, error } = await supabase
      .from('user_likes')
      .select(`
        *,
        content (*)
      `)
      .eq('user_id', req.user!.userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new AppError(500, 'Error al obtener los likes')
    }

    res.json(likes || [])
  } catch (error) {
    next(error)
  }
})

// Toggle like on content
userRouter.post('/likes', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const schema = z.object({
      externalId: z.string(),
      type: z.enum(['movie', 'tv', 'anime']),
      title: z.string(),
      posterPath: z.string().optional(),
    })

    const data = schema.parse(req.body)

    // First, ensure content exists in our database
    const { data: existingContent } = await supabase
      .from('content')
      .select('*')
      .eq('external_id', data.externalId)
      .eq('type', data.type)
      .single<DbContent>()

    let content = existingContent

    if (!content) {
      const { data: newContent, error: createError } = await supabase
        .from('content')
        .insert({
          external_id: data.externalId,
          type: data.type,
          title: data.title,
          poster_path: data.posterPath,
        })
        .select()
        .single<DbContent>()

      if (createError || !newContent) {
        throw new AppError(500, 'Error al crear el contenido')
      }

      content = newContent
    }

    // Check if user already liked this content
    const { data: existingLike } = await supabase
      .from('user_likes')
      .select('id')
      .eq('user_id', req.user!.userId)
      .eq('content_id', content!.id)
      .single()

    if (existingLike) {
      // Unlike - remove the like
      const { error } = await supabase
        .from('user_likes')
        .delete()
        .eq('id', existingLike.id)

      if (error) {
        throw new AppError(500, 'Error al quitar el like')
      }

      res.json({ liked: false })
    } else {
      // Like - add the like
      const { data: newLike, error } = await supabase
        .from('user_likes')
        .insert({
          user_id: req.user!.userId,
          content_id: content!.id,
        })
        .select(`
          *,
          content (*)
        `)
        .single()

      if (error || !newLike) {
        throw new AppError(500, 'Error al agregar el like')
      }

      res.status(201).json({ liked: true, data: newLike })
    }
  } catch (error) {
    next(error)
  }
})

// Check if content is liked by user
userRouter.get('/likes/check/:externalId/:type', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { externalId, type } = req.params

    // Get content by external_id and type
    const { data: content } = await supabase
      .from('content')
      .select('id')
      .eq('external_id', externalId)
      .eq('type', type)
      .single<DbContent>()

    if (!content) {
      return res.json({ liked: false })
    }

    // Check if user has liked this content
    const { data: like } = await supabase
      .from('user_likes')
      .select('id')
      .eq('user_id', req.user!.userId)
      .eq('content_id', content.id)
      .single()

    res.json({ liked: !!like })
  } catch (error) {
    next(error)
  }
})
