import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { logger } from '../config/logger';
import type { RegisterInput, LoginInput } from '../validators/auth.validators';

export class AuthController {
  /**
   * Register a new user
   * POST /api/auth/register
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const data: RegisterInput = req.body;

      const result = await authService.register(data);

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: result.user.id,
          email: result.user.email,
          username: result.profile?.username,
          displayName: result.profile?.display_name,
        },
        session: result.session,
      });
    } catch (error: any) {
      logger.error('Register controller error:', error);

      // Handle specific Supabase errors
      if (error.message?.includes('already registered')) {
        res.status(409).json({
          error: 'Conflict',
          message: 'Email already registered',
        });
        return;
      }

      if (error.message?.includes('duplicate key')) {
        res.status(409).json({
          error: 'Conflict',
          message: 'Username already taken',
        });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Registration failed',
      });
    }
  }

  /**
   * Login user
   * POST /api/auth/login
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const data: LoginInput = req.body;

      const result = await authService.login(data);

      res.status(200).json({
        message: 'Login successful',
        user: {
          id: result.user.id,
          email: result.user.email,
          username: result.profile?.username,
          displayName: result.profile?.display_name,
        },
        session: result.session,
      });
    } catch (error: any) {
      logger.error('Login controller error:', error);

      if (error.message?.includes('Invalid login credentials')) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid email or password',
        });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Login failed',
      });
    }
  }

  /**
   * Logout user
   * POST /api/auth/logout
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'No access token provided',
        });
        return;
      }

      const token = authHeader.substring(7);

      await authService.logout(token);

      res.status(200).json({
        message: 'Logout successful',
      });
    } catch (error) {
      logger.error('Logout controller error:', error);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Logout failed',
      });
    }
  }

  /**
   * Refresh access token
   * POST /api/auth/refresh
   */
  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Refresh token is required',
        });
        return;
      }

      const result = await authService.refreshToken(refreshToken);

      res.status(200).json({
        message: 'Token refreshed successfully',
        session: result.session,
      });
    } catch (error) {
      logger.error('Refresh token controller error:', error);

      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired refresh token',
      });
    }
  }

  /**
   * Get current user
   * GET /api/auth/me
   */
  async getMe(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'No access token provided',
        });
        return;
      }

      const token = authHeader.substring(7);

      const result = await authService.getUserByToken(token);

      res.status(200).json({
        user: {
          id: result.user.id,
          email: result.user.email,
          ...result.profile,
        },
      });
    } catch (error) {
      logger.error('Get me controller error:', error);

      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired token',
      });
    }
  }
}

export const authController = new AuthController();
