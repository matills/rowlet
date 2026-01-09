import { z } from 'zod';

export const collaboratorRoleSchema = z.enum(['admin', 'editor', 'viewer']);

export const addCollaboratorSchema = z.object({
  username: z.string().min(3).max(30),
  role: collaboratorRoleSchema.default('viewer'),
});

export const updateCollaboratorRoleSchema = z.object({
  role: collaboratorRoleSchema,
});

export const inviteCollaboratorSchema = z.object({
  username: z.string().min(3).max(30),
  role: collaboratorRoleSchema.default('viewer'),
});

export const respondInvitationSchema = z.object({
  accept: z.boolean(),
});

export const generateShareCodeSchema = z.object({
  regenerate: z.boolean().optional().default(false),
});

export type AddCollaboratorInput = z.infer<typeof addCollaboratorSchema>;
export type UpdateCollaboratorRoleInput = z.infer<typeof updateCollaboratorRoleSchema>;
export type InviteCollaboratorInput = z.infer<typeof inviteCollaboratorSchema>;
export type RespondInvitationInput = z.infer<typeof respondInvitationSchema>;
export type GenerateShareCodeInput = z.infer<typeof generateShareCodeSchema>;
