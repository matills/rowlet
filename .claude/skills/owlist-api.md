---
name: owlist-api
description: >
  Owlist backend API patterns with Node.js, Express, and TypeScript.
  Covers route structure, middleware, services, error handling, and validation.
  Trigger: When working on backend API endpoints, services, or middleware.
license: MIT
metadata:
  author: owlist
  version: "1.0"
  scope: [root, backend]
  auto_invoke:
    - "Creating API endpoints"
    - "Working on backend services"
    - "API middleware"
    - "Request validation"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash
---

## Related Skills

- `owlist-supabase` - Database queries and RLS
- `owlist-api-integration` - TMDB/AniList clients

## Tech Stack

```
Node.js 20+ | Express 4.x | TypeScript 5.4
Zod (validation) | Supabase Client | Winston (logging)
```

## Project Structure

```
backend/
├── src/
│   ├── index.ts              # App entry point
│   ├── app.ts                # Express app setup
│   ├── routes/
│   │   ├── index.ts          # Route aggregator
│   │   ├── auth.routes.ts
│   │   ├── content.routes.ts
│   │   ├── tracking.routes.ts
│   │   ├── lists.routes.ts
│   │   ├── reviews.routes.ts
│   │   ├── users.routes.ts
│   │   └── achievements.routes.ts
│   ├── controllers/
│   │   └── {feature}.controller.ts
│   ├── services/
│   │   ├── content.service.ts
│   │   ├── tracking.service.ts
│   │   ├── achievement.service.ts
│   │   └── ...
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── validate.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── rate-limit.middleware.ts
│   ├── integrations/
│   │   ├── tmdb/
│   │   └── anilist/
│   ├── lib/
│   │   ├── supabase.ts
│   │   └── logger.ts
│   ├── types/
│   │   └── index.ts
│   └── validators/
│       └── {feature}.validator.ts
├── tests/
└── package.json
```

## Express App Setup

```typescript
// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { router } from './routes';
import { errorHandler } from './middleware/error.middleware';
import { requestLogger } from './middleware/logger.middleware';

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Parsing
app.use(express.json({ limit: '10kb' }));

// Logging
app.use(requestLogger);

// Routes
app.use('/api/v1', router);

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok' }));

// Error handling (must be last)
app.use(errorHandler);

export { app };
```

## Route Pattern

```typescript
// src/routes/tracking.routes.ts
import { Router } from 'express';
import { authenticate } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validate.middleware';
import { trackingController } from '@/controllers/tracking.controller';
import {
  addTrackingSchema,
  updateTrackingSchema,
  getTrackingSchema,
} from '@/validators/tracking.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/v1/tracking - Get user's tracked content
router.get('/', trackingController.getUserTracking);

// GET /api/v1/tracking/:contentId - Get tracking for specific content
router.get('/:contentId', validate(getTrackingSchema), trackingController.getTracking);

// POST /api/v1/tracking - Add content to tracking
router.post('/', validate(addTrackingSchema), trackingController.addTracking);

// PATCH /api/v1/tracking/:contentId - Update tracking status
router.patch('/:contentId', validate(updateTrackingSchema), trackingController.updateTracking);

// DELETE /api/v1/tracking/:contentId - Remove from tracking
router.delete('/:contentId', trackingController.removeTracking);

export { router as trackingRoutes };
```

## Controller Pattern

```typescript
// src/controllers/tracking.controller.ts
import type { Request, Response, NextFunction } from 'express';
import { trackingService } from '@/services/tracking.service';
import { achievementService } from '@/services/achievement.service';
import { AppError } from '@/lib/errors';

export const trackingController = {
  async getUserTracking(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { status, type, page = 1, limit = 20 } = req.query;

      const result = await trackingService.getUserTracking(userId, {
        status: status as string,
        type: type as string,
        page: Number(page),
        limit: Number(limit),
      });

      res.json({
        success: true,
        data: result.items,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async addTracking(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { contentId, status, rating, episodesWatched } = req.body;

      const tracking = await trackingService.addTracking(userId, {
        contentId,
        status,
        rating,
        episodesWatched,
      });

      // Trigger achievement evaluation (async, don't await)
      achievementService.evaluateAchievements({
        userId,
        type: 'content_added',
        data: { contentId, status },
      }).catch(console.error);

      res.status(201).json({
        success: true,
        data: tracking,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateTracking(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { contentId } = req.params;
      const updates = req.body;

      const tracking = await trackingService.updateTracking(userId, contentId, updates);

      if (!tracking) {
        throw new AppError('Tracking not found', 404);
      }

      res.json({
        success: true,
        data: tracking,
      });
    } catch (error) {
      next(error);
    }
  },

  async removeTracking(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { contentId } = req.params;

      await trackingService.removeTracking(userId, contentId);

      res.json({
        success: true,
        message: 'Tracking removed',
      });
    } catch (error) {
      next(error);
    }
  },
};
```

## Service Pattern

```typescript
// src/services/tracking.service.ts
import { supabase } from '@/lib/supabase';
import type { TrackingStatus, UserContent } from '@/types';

interface GetTrackingOptions {
  status?: string;
  type?: string;
  page: number;
  limit: number;
}

interface AddTrackingData {
  contentId: string;
  status: TrackingStatus;
  rating?: number;
  episodesWatched?: number;
}

export const trackingService = {
  async getUserTracking(userId: string, options: GetTrackingOptions) {
    const { status, type, page, limit } = options;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('user_content')
      .select('*, content(*)', { count: 'exact' })
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    if (type) {
      query = query.eq('content.type', type);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      items: data || [],
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    };
  },

  async addTracking(userId: string, data: AddTrackingData): Promise<UserContent> {
    const { data: tracking, error } = await supabase
      .from('user_content')
      .upsert({
        user_id: userId,
        content_id: data.contentId,
        status: data.status,
        rating: data.rating,
        episodes_watched: data.episodesWatched,
        watched_at: data.status === 'watched' ? new Date().toISOString() : null,
      }, {
        onConflict: 'user_id,content_id',
      })
      .select('*, content(*)')
      .single();

    if (error) throw error;
    return tracking;
  },

  async updateTracking(userId: string, contentId: string, updates: Partial<AddTrackingData>) {
    const { data, error } = await supabase
      .from('user_content')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('content_id', contentId)
      .select('*, content(*)')
      .single();

    if (error) throw error;
    return data;
  },

  async removeTracking(userId: string, contentId: string) {
    const { error } = await supabase
      .from('user_content')
      .delete()
      .eq('user_id', userId)
      .eq('content_id', contentId);

    if (error) throw error;
  },
};
```

## Authentication Middleware

```typescript
// src/middleware/auth.middleware.ts
import type { Request, Response, NextFunction } from 'express';
import { supabase } from '@/lib/supabase';
import { AppError } from '@/lib/errors';

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string };
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('Missing or invalid authorization header', 401);
    }

    const token = authHeader.split(' ')[1];

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new AppError('Invalid or expired token', 401);
    }

    req.user = {
      id: user.id,
      email: user.email!,
    };

    next();
  } catch (error) {
    next(error);
  }
}

// Optional auth - sets user if token present, continues otherwise
export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next();
  }

  return authenticate(req, res, next);
}
```

## Validation Middleware

```typescript
// src/middleware/validate.middleware.ts
import type { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { AppError } from '@/lib/errors';

interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export function validate(schemas: ValidationSchemas) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
      }
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
        next(new AppError(`Validation error: ${messages.join(', ')}`, 400));
      } else {
        next(error);
      }
    }
  };
}
```

```typescript
// src/validators/tracking.validator.ts
import { z } from 'zod';

export const addTrackingSchema = {
  body: z.object({
    contentId: z.string().uuid(),
    status: z.enum(['watched', 'watching', 'want_to_watch', 'dropped', 'paused']),
    rating: z.number().int().min(1).max(10).optional(),
    episodesWatched: z.number().int().min(0).optional(),
  }),
};

export const updateTrackingSchema = {
  params: z.object({
    contentId: z.string().uuid(),
  }),
  body: z.object({
    status: z.enum(['watched', 'watching', 'want_to_watch', 'dropped', 'paused']).optional(),
    rating: z.number().int().min(1).max(10).optional(),
    episodesWatched: z.number().int().min(0).optional(),
  }),
};

export const getTrackingSchema = {
  params: z.object({
    contentId: z.string().uuid(),
  }),
};
```

## Error Handling

```typescript
// src/lib/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// src/middleware/error.middleware.ts
import type { Request, Response, NextFunction } from 'express';
import { AppError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log error
  logger.error({
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
  });

  // AppError - known errors
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        message: error.message,
        code: error.code,
      },
    });
  }

  // Unknown errors - don't leak details
  res.status(500).json({
    success: false,
    error: {
      message: 'Internal server error',
    },
  });
}
```

## API Response Format

```typescript
// Success response
{
  "success": true,
  "data": { ... },
  "pagination": { // optional
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}

// Error response
{
  "success": false,
  "error": {
    "message": "Validation error: status: Invalid enum value",
    "code": "VALIDATION_ERROR" // optional
  }
}
```

## Commands

```bash
cd backend

# Development
pnpm dev              # Start with hot reload

# Quality
pnpm typecheck        # TypeScript check
pnpm lint             # ESLint
pnpm lint:fix         # ESLint with fix
pnpm test             # Run tests
pnpm healthcheck      # All checks

# Production
pnpm build            # Compile TypeScript
pnpm start            # Start production server
```

## Environment Variables

```bash
# .env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Supabase
SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_KEY=your-service-key

# External APIs
TMDB_API_KEY=your-tmdb-key
```