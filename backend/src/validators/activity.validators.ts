import { z } from 'zod';

export const activityTypeSchema = z.enum([
  'WATCHED_MEDIA',
  'RATED_MEDIA',
  'ADDED_TO_LIST',
  'REMOVED_FROM_LIST',
  'COMPLETED_MEDIA',
  'CREATED_LIST',
  'UPDATED_LIST',
  'STARTED_WATCHING',
  'FOLLOWED_USER',
  'UNFOLLOWED_USER',
  'JOINED_COLLABORATIVE_LIST',
  'ADDED_TO_FAVORITES',
]);

export const getFeedQuerySchema = z.object({
  page: z.string().optional().transform(val => parseInt(val || '1', 10)),
  limit: z.string().optional().transform(val => parseInt(val || '20', 10)),
  type: activityTypeSchema.optional(),
});

export const getUserActivityQuerySchema = z.object({
  page: z.string().optional().transform(val => parseInt(val || '1', 10)),
  limit: z.string().optional().transform(val => parseInt(val || '20', 10)),
  type: activityTypeSchema.optional(),
});

export type GetFeedQuery = z.infer<typeof getFeedQuerySchema>;
export type GetUserActivityQuery = z.infer<typeof getUserActivityQuerySchema>;
