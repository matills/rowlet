import { Router } from 'express'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../config/prisma.js'
import { env } from '../config/env.js'
import { authenticate } from '../middlewares/auth.js'
import { AppError } from '../middlewares/errorHandler.js'
import type { AuthRequest } from '../types/index.js'

export const authRouter = Router()

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  displayName: z.string().optional(),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

// Register
authRouter.post('/register', async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body)

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          { username: data.username },
        ],
      },
    })

    if (existingUser) {
      throw new AppError(400, 'El email o nombre de usuario ya está en uso')
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        username: data.username,
        displayName: data.displayName,
      },
    })

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    )

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        isPublic: user.isPublic,
        createdAt: user.createdAt,
      },
      token,
    })
  } catch (error) {
    next(error)
  }
})

// Login
authRouter.post('/login', async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body)

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (!user) {
      throw new AppError(401, 'Credenciales inválidas')
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(data.password, user.password)

    if (!isValidPassword) {
      throw new AppError(401, 'Credenciales inválidas')
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    )

    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        isPublic: user.isPublic,
        createdAt: user.createdAt,
      },
      token,
    })
  } catch (error) {
    next(error)
  }
})

// Get profile
authRouter.get('/profile', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
    })

    if (!user) {
      throw new AppError(404, 'Usuario no encontrado')
    }

    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      isPublic: user.isPublic,
      createdAt: user.createdAt,
    })
  } catch (error) {
    next(error)
  }
})

// Update profile
authRouter.patch('/profile', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const updateSchema = z.object({
      displayName: z.string().optional(),
      bio: z.string().max(500).optional(),
      avatarUrl: z.string().url().optional(),
      isPublic: z.boolean().optional(),
    })

    const data = updateSchema.parse(req.body)

    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data,
    })

    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      isPublic: user.isPublic,
      createdAt: user.createdAt,
    })
  } catch (error) {
    next(error)
  }
})

// Logout (just for API consistency, JWT is stateless)
authRouter.post('/logout', authenticate, (req, res) => {
  res.json({ message: 'Logged out successfully' })
})
