import { Router } from 'express'
import { z } from 'zod'
import { supabase } from '../config/supabase.js'
import { authenticate, optionalAuth } from '../middlewares/auth.js'
import { AppError } from '../middlewares/errorHandler.js'
import type { AuthRequest, DbUserList, DbListItem } from '../types/index.js'

export const listRouter = Router()

// Get user's lists
listRouter.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { data: lists, error } = await supabase
      .from('user_lists')
      .select(`
        *,
        list_items (
          *,
          content (*)
        )
      `)
      .eq('user_id', req.user!.userId)
      .order('updated_at', { ascending: false })

    if (error) {
      throw new AppError(500, 'Error al obtener las listas')
    }

    res.json(lists || [])
  } catch (error) {
    next(error)
  }
})

// Get list by ID
listRouter.get('/:id', optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params

    const { data: list, error } = await supabase
      .from('user_lists')
      .select(`
        *,
        list_items (
          *,
          content (*)
        ),
        users (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('id', id)
      .single()

    if (error || !list) {
      throw new AppError(404, 'Lista no encontrada')
    }

    // Check if user can access this list
    if (!list.is_public && list.user_id !== req.user?.userId) {
      throw new AppError(403, 'No tienes acceso a esta lista')
    }

    res.json(list)
  } catch (error) {
    next(error)
  }
})

// Create list
listRouter.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const schema = z.object({
      name: z.string().min(1).max(100),
      description: z.string().max(500).optional(),
      isPublic: z.boolean().default(false),
    })

    const data = schema.parse(req.body)

    const { data: list, error } = await supabase
      .from('user_lists')
      .insert({
        name: data.name,
        description: data.description,
        is_public: data.isPublic,
        user_id: req.user!.userId,
      })
      .select()
      .single<DbUserList>()

    if (error || !list) {
      throw new AppError(500, 'Error al crear la lista')
    }

    res.status(201).json(list)
  } catch (error) {
    next(error)
  }
})

// Update list
listRouter.patch('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params

    const schema = z.object({
      name: z.string().min(1).max(100).optional(),
      description: z.string().max(500).optional(),
      isPublic: z.boolean().optional(),
    })

    const data = schema.parse(req.body)

    // Check if list exists and belongs to user
    const { data: list } = await supabase
      .from('user_lists')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.user!.userId)
      .single()

    if (!list) {
      throw new AppError(404, 'Lista no encontrada')
    }

    // Build update data
    const updateData: Partial<DbUserList> = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.isPublic !== undefined) updateData.is_public = data.isPublic

    const { data: updated, error } = await supabase
      .from('user_lists')
      .update(updateData)
      .eq('id', id)
      .select()
      .single<DbUserList>()

    if (error || !updated) {
      throw new AppError(500, 'Error al actualizar la lista')
    }

    res.json(updated)
  } catch (error) {
    next(error)
  }
})

// Delete list
listRouter.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params

    const { data: list } = await supabase
      .from('user_lists')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.user!.userId)
      .single()

    if (!list) {
      throw new AppError(404, 'Lista no encontrada')
    }

    const { error } = await supabase
      .from('user_lists')
      .delete()
      .eq('id', id)

    if (error) {
      throw new AppError(500, 'Error al eliminar la lista')
    }

    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

// Add item to list
listRouter.post('/:id/items', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params

    const schema = z.object({
      contentId: z.string(),
    })

    const { contentId } = schema.parse(req.body)

    // Check if list exists and belongs to user
    const { data: list } = await supabase
      .from('user_lists')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.user!.userId)
      .single()

    if (!list) {
      throw new AppError(404, 'Lista no encontrada')
    }

    // Check if content already in list
    const { data: existingItem } = await supabase
      .from('list_items')
      .select('id')
      .eq('list_id', id)
      .eq('content_id', contentId)
      .single()

    if (existingItem) {
      throw new AppError(400, 'El contenido ya está en la lista')
    }

    // Get max order
    const { data: maxOrderItem } = await supabase
      .from('list_items')
      .select('order')
      .eq('list_id', id)
      .order('order', { ascending: false })
      .limit(1)
      .single()

    const maxOrder = maxOrderItem?.order || 0

    const { data: item, error } = await supabase
      .from('list_items')
      .insert({
        list_id: id,
        content_id: contentId,
        order: maxOrder + 1,
      })
      .select(`
        *,
        content (*)
      `)
      .single()

    if (error || !item) {
      throw new AppError(500, 'Error al agregar el item a la lista')
    }

    res.status(201).json(item)
  } catch (error) {
    next(error)
  }
})

// Remove item from list
listRouter.delete('/:listId/items/:itemId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { listId, itemId } = req.params

    const { data: list } = await supabase
      .from('user_lists')
      .select('id')
      .eq('id', listId)
      .eq('user_id', req.user!.userId)
      .single()

    if (!list) {
      throw new AppError(404, 'Lista no encontrada')
    }

    const { error } = await supabase
      .from('list_items')
      .delete()
      .eq('id', itemId)

    if (error) {
      throw new AppError(500, 'Error al eliminar el item de la lista')
    }

    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

// Reorder items
listRouter.patch('/:id/reorder', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params

    const schema = z.object({
      itemIds: z.array(z.string()),
    })

    const { itemIds } = schema.parse(req.body)

    const { data: list } = await supabase
      .from('user_lists')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.user!.userId)
      .single()

    if (!list) {
      throw new AppError(404, 'Lista no encontrada')
    }

    // Update order for each item
    await Promise.all(
      itemIds.map((itemId, index) =>
        supabase
          .from('list_items')
          .update({ order: index })
          .eq('id', itemId)
      )
    )

    res.json({ message: 'Items reordered successfully' })
  } catch (error) {
    next(error)
  }
})
