import { z } from 'zod';

export const UpdateNotificationPreferencesSchema = z.object({
  achievement_unlocked: z.boolean().optional(),
  level_up: z.boolean().optional(),
  new_follower: z.boolean().optional(),
  list_invitation: z.boolean().optional(),
  list_invitation_accepted: z.boolean().optional(),
  user_activity: z.boolean().optional(),
  episode_reminder: z.boolean().optional(),
  review_comment: z.boolean().optional(),
  list_item_added: z.boolean().optional(),
  system: z.boolean().optional(),
  email_enabled: z.boolean().optional(),
});

export type UpdateNotificationPreferencesInput = z.infer<typeof UpdateNotificationPreferencesSchema>;
