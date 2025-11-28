import { Router } from 'express'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { supabase } from '../config/supabase.js'
import { env } from '../config/env.js'
import { authenticate } from '../middlewares/auth.js'
import { AppError } from '../middlewares/errorHandler.js'
import type { AuthRequest, DbUser } from '../types/index.js'

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
    const { data: existingUsers } = await supabase
      .from('users')
      .select('id')
      .or(`email.eq.${data.email},username.eq.${data.username}`)
      .limit(1)

    if (existingUsers && existingUsers.length > 0) {
      throw new AppError(400, 'El email o nombre de usuario ya está en uso')
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10)

    // Create user
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email: data.email,
        password: hashedPassword,
        username: data.username,
        display_name: data.displayName,
      })
      .select()
      .single<DbUser>()

    if (error || !user) {
      throw new AppError(500, 'Error al crear el usuario')
    }

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
        displayName: user.display_name,
        avatarUrl: user.avatar_url,
        isPublic: user.is_public,
        createdAt: user.created_at,
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
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', data.email)
      .single<DbUser>()

    if (error || !user) {
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
        displayName: user.display_name,
        avatarUrl: user.avatar_url,
        isPublic: user.is_public,
        createdAt: user.created_at,
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
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user!.userId)
      .single<DbUser>()

    if (error || !user) {
      throw new AppError(404, 'Usuario no encontrado')
    }

    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.display_name,
      avatarUrl: user.avatar_url,
      bio: user.bio,
      isPublic: user.is_public,
      createdAt: user.created_at,
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

    // Convert camelCase to snake_case
    const updateData: Partial<DbUser> = {}
    if (data.displayName !== undefined) updateData.display_name = data.displayName
    if (data.bio !== undefined) updateData.bio = data.bio
    if (data.avatarUrl !== undefined) updateData.avatar_url = data.avatarUrl
    if (data.isPublic !== undefined) updateData.is_public = data.isPublic

    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', req.user!.userId)
      .select()
      .single<DbUser>()

    if (error || !user) {
      throw new AppError(500, 'Error al actualizar el perfil')
    }

    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.display_name,
      avatarUrl: user.avatar_url,
      bio: user.bio,
      isPublic: user.is_public,
      createdAt: user.created_at,
    })
  } catch (error) {
    next(error)
  }
})

// Logout (just for API consistency, JWT is stateless)
authRouter.post('/logout', authenticate, (req, res) => {
  res.json({ message: 'Logged out successfully' })
})

// OAuth - Sync Supabase user with backend
authRouter.post('/oauth', async (req, res, next) => {
  try {
    const { email, name, avatarUrl } = req.body

    if (!email) {
      throw new AppError(400, 'Email es requerido')
    }

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single<DbUser>()

    let user: DbUser

    if (existingUser) {
      // User exists, update their info
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update({
          display_name: name || existingUser.display_name,
          avatar_url: avatarUrl || existingUser.avatar_url,
        })
        .eq('id', existingUser.id)
        .select()
        .single<DbUser>()

      if (error || !updatedUser) {
        throw new AppError(500, 'Error al actualizar el usuario')
      }

      user = updatedUser
    } else {
      // Create new user
      const username = email.split('@')[0] + '_' + Math.random().toString(36).substring(7)

      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          email: email,
          username: username,
          display_name: name || username,
          avatar_url: avatarUrl,
          password: '', // No password for OAuth users
        })
        .select()
        .single<DbUser>()

      if (error || !newUser) {
        throw new AppError(500, 'Error al crear el usuario')
      }

      user = newUser
    }

    // Generate JWT token
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
        displayName: user.display_name,
        avatarUrl: user.avatar_url,
        isPublic: user.is_public,
        createdAt: user.created_at,
      },
      token,
    })
  } catch (error) {
    next(error)
  }
})
