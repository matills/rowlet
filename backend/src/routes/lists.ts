import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../config/prisma.js'
import { authenticate, optionalAuth } from '../middlewares/auth.js'
import { AppError } from '../middlewares/errorHandler.js'
import type { AuthRequest } from '../types/index.js'

export const listRouter = Router()

// Get user's lists
listRouter.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const lists = await prisma.userList.findMany({
      where: { userId: req.user!.userId },
      include: {
        items: {
          include: { content: true },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    res.json(lists)
  } catch (error) {
    next(error)
  }
})

// Get list by ID
listRouter.get('/:id', optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params

    const list = await prisma.userList.findUnique({
      where: { id },
      include: {
        items: {
          include: { content: true },
          orderBy: { order: 'asc' },
        },
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    })

    if (!list) {
      throw new AppError(404, 'Lista no encontrada')
    }

    // Check if user can access this list
    if (!list.isPublic && list.userId !== req.user?.userId) {
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

    const list = await prisma.userList.create({
      data: {
        ...data,
        userId: req.user!.userId,
      },
    })

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

    const list = await prisma.userList.findFirst({
      where: {
        id,
        userId: req.user!.userId,
      },
    })

    if (!list) {
      throw new AppError(404, 'Lista no encontrada')
    }

    const updated = await prisma.userList.update({
      where: { id },
      data,
    })

    res.json(updated)
  } catch (error) {
    next(error)
  }
})

// Delete list
listRouter.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params

    const list = await prisma.userList.findFirst({
      where: {
        id,
        userId: req.user!.userId,
      },
    })

    if (!list) {
      throw new AppError(404, 'Lista no encontrada')
    }

    await prisma.userList.delete({
      where: { id },
    })

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

    const list = await prisma.userList.findFirst({
      where: {
        id,
        userId: req.user!.userId,
      },
      include: {
        items: {
          orderBy: { order: 'desc' },
          take: 1,
        },
      },
    })

    if (!list) {
      throw new AppError(404, 'Lista no encontrada')
    }

    // Check if content already in list
    const existingItem = await prisma.listItem.findFirst({
      where: {
        listId: id,
        contentId,
      },
    })

    if (existingItem) {
      throw new AppError(400, 'El contenido ya está en la lista')
    }

    const maxOrder = list.items[0]?.order || 0

    const item = await prisma.listItem.create({
      data: {
        listId: id,
        contentId,
        order: maxOrder + 1,
      },
      include: { content: true },
    })

    res.status(201).json(item)
  } catch (error) {
    next(error)
  }
})

// Remove item from list
listRouter.delete('/:listId/items/:itemId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { listId, itemId } = req.params

    const list = await prisma.userList.findFirst({
      where: {
        id: listId,
        userId: req.user!.userId,
      },
    })

    if (!list) {
      throw new AppError(404, 'Lista no encontrada')
    }

    await prisma.listItem.delete({
      where: { id: itemId },
    })

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

    const list = await prisma.userList.findFirst({
      where: {
        id,
        userId: req.user!.userId,
      },
    })

    if (!list) {
      throw new AppError(404, 'Lista no encontrada')
    }

    // Update order for each item
    await Promise.all(
      itemIds.map((itemId, index) =>
        prisma.listItem.update({
          where: { id: itemId },
          data: { order: index },
        })
      )
    )

    res.json({ message: 'Items reordered successfully' })
  } catch (error) {
    next(error)
  }
})
