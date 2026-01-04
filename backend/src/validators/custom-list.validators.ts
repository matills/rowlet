import { z } from 'zod';

/**
 * Create custom list validation
 */
export const CreateCustomListSchema = z.object({
  name: z
    .string()
    .min(1, 'List name is required')
    .max(100, 'List name must be at most 100 characters'),
  description: z.string().max(500, 'Description is too long').optional(),
  coverImageUrl: z.string().url('Invalid URL format').optional().nullable(),
  isPublic: z.boolean().default(true),
});

export type CreateCustomListInput = z.infer<typeof CreateCustomListSchema>;

/**
 * Update custom list validation
 */
export const UpdateCustomListSchema = z.object({
  name: z
    .string()
    .min(1, 'List name must not be empty')
    .max(100, 'List name must be at most 100 characters')
    .optional(),
  description: z.string().max(500, 'Description is too long').optional().nullable(),
  coverImageUrl: z.string().url('Invalid URL format').optional().nullable(),
  isPublic: z.boolean().optional(),
});

export type UpdateCustomListInput = z.infer<typeof UpdateCustomListSchema>;

/**
 * Add item to list validation
 */
export const AddListItemSchema = z.object({
  mediaId: z.string().uuid('Invalid media ID'),
  position: z.number().int().min(0).optional(),
  notes: z.string().max(500, 'Notes are too long').optional(),
});

export type AddListItemInput = z.infer<typeof AddListItemSchema>;

/**
 * Update list item validation
 */
export const UpdateListItemSchema = z.object({
  position: z.number().int().min(0).optional(),
  notes: z.string().max(500, 'Notes are too long').optional().nullable(),
});

export type UpdateListItemInput = z.infer<typeof UpdateListItemSchema>;

/**
 * List ID param validation
 */
export const ListIdSchema = z.object({
  id: z.string().uuid('Invalid list ID'),
});

export type ListIdParam = z.infer<typeof ListIdSchema>;

/**
 * Query params for lists
 */
export const ListsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  isPublic: z.coerce.boolean().optional(),
});

export type ListsQueryInput = z.infer<typeof ListsQuerySchema>;
