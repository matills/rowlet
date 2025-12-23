import { z } from 'zod';

// Media type enum
export const MediaTypeSchema = z.enum(['movie', 'series', 'anime']);
export type MediaType = z.infer<typeof MediaTypeSchema>;

// Media source enum
export const MediaSourceSchema = z.enum(['tmdb', 'anilist']);
export type MediaSource = z.infer<typeof MediaSourceSchema>;

// Anime subtype enum
export const AnimeSubtypeSchema = z.enum(['tv', 'movie', 'ova', 'ona', 'special', 'music']);
export type AnimeSubtype = z.infer<typeof AnimeSubtypeSchema>;

/**
 * Media search query validation
 */
export const MediaSearchSchema = z.object({
  search: z.string().optional(),
  type: MediaTypeSchema.optional(),
  genre: z.string().optional(),
  year: z.coerce.number().int().min(1900).max(2100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type MediaSearchInput = z.infer<typeof MediaSearchSchema>;

/**
 * Create media validation
 */
export const CreateMediaSchema = z.object({
  title: z.string().min(1).max(500),
  original_title: z.string().max(500).optional(),
  overview: z.string().optional(),
  type: MediaTypeSchema,
  subtype: AnimeSubtypeSchema.optional(),
  source: MediaSourceSchema,
  external_id: z.string().min(1),
  poster_path: z.string().optional().nullable(),
  backdrop_path: z.string().optional().nullable(),
  release_date: z.string().optional().nullable(), // ISO date string
  end_date: z.string().optional().nullable(),
  genres: z.array(z.string()).optional(),
  studios: z.array(z.string()).optional(),
  score: z.number().min(0).max(10).optional().nullable(),
  popularity: z.number().optional().nullable(),
  total_episodes: z.number().int().min(1).optional().nullable(),
  episode_duration: z.number().int().min(1).optional().nullable(),
  status: z.string().optional().nullable(),
  tmdb_data: z.any().optional(),
  anilist_data: z.any().optional(),
});

export type CreateMediaInput = z.infer<typeof CreateMediaSchema>;

/**
 * Update media validation
 */
export const UpdateMediaSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  original_title: z.string().max(500).optional(),
  overview: z.string().optional(),
  poster_path: z.string().optional().nullable(),
  backdrop_path: z.string().optional().nullable(),
  release_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  genres: z.array(z.string()).optional(),
  studios: z.array(z.string()).optional(),
  score: z.number().min(0).max(10).optional().nullable(),
  popularity: z.number().optional().nullable(),
  total_episodes: z.number().int().min(1).optional().nullable(),
  episode_duration: z.number().int().min(1).optional().nullable(),
  status: z.string().optional().nullable(),
  tmdb_data: z.any().optional(),
  anilist_data: z.any().optional(),
});

export type UpdateMediaInput = z.infer<typeof UpdateMediaSchema>;

/**
 * External search validation
 */
export const ExternalSearchSchema = z.object({
  query: z.string().min(1),
  type: MediaTypeSchema,
  page: z.coerce.number().int().min(1).default(1),
});

export type ExternalSearchInput = z.infer<typeof ExternalSearchSchema>;

/**
 * Import from external API validation
 */
export const ImportMediaSchema = z.object({
  externalId: z.string().min(1),
  source: MediaSourceSchema,
  type: MediaTypeSchema,
});

export type ImportMediaInput = z.infer<typeof ImportMediaSchema>;

/**
 * Media ID params validation
 */
export const MediaIdSchema = z.object({
  id: z.string().uuid(),
});

export type MediaIdParam = z.infer<typeof MediaIdSchema>;

/**
 * Season params validation
 */
export const SeasonParamsSchema = z.object({
  id: z.string().uuid(),
  seasonNumber: z.coerce.number().int().min(1),
});

export type SeasonParamsInput = z.infer<typeof SeasonParamsSchema>;
