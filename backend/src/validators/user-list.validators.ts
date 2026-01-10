import { z } from 'zod';

export const UserMediaStatusSchema = z.enum([
  'watching',
  'completed',
  'plan_to_watch',
  'on_hold',
  'dropped',
]);

export type UserMediaStatus = z.infer<typeof UserMediaStatusSchema>;

export const AddToListSchema = z.object({
  mediaId: z.string().uuid('Invalid media ID'),
  status: UserMediaStatusSchema,
  score: z.number().min(0).max(10).optional().nullable(),
  notes: z.string().max(1000).optional(),
  episodesWatched: z.number().int().min(0).optional().default(0),
});

export type AddToListInput = z.infer<typeof AddToListSchema>;

export const UpdateListItemSchema = z.object({
  status: UserMediaStatusSchema.optional(),
  score: z.number().min(0).max(10).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  episodesWatched: z.number().int().min(0).optional(),
  rewatchCount: z.number().int().min(0).optional(),
});

export type UpdateListItemInput = z.infer<typeof UpdateListItemSchema>;

export const UpdateProgressSchema = z.object({
  episodesWatched: z.number().int().min(0),
});

export type UpdateProgressInput = z.infer<typeof UpdateProgressSchema>;

export const ListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z
    .enum(['updated_at', 'created_at', 'score', 'title'])
    .default('updated_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type ListQueryInput = z.infer<typeof ListQuerySchema>;
