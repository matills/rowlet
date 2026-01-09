import { supabaseAdmin } from '../config/supabase';
import { logger } from '../config/logger';
import type {
  CollaboratorRole,
  CollaboratorWithUser,
  InvitationWithDetails,
} from '../types/collaborator.types';

export class CollaboratorService {
  async getListCollaborators(listId: string): Promise<CollaboratorWithUser[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('list_collaborators')
        .select(`
          *,
          user:user_id (
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('list_id', listId)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching collaborators:', error);
        throw new Error('Failed to fetch collaborators');
      }

      return data as CollaboratorWithUser[];
    } catch (error) {
      logger.error('Get list collaborators error:', error);
      throw error;
    }
  }

  async addCollaborator(
    listId: string,
    username: string,
    role: CollaboratorRole,
    addedBy: string
  ): Promise<void> {
    try {
      const { data: targetUser, error: userError } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('username', username)
        .single();

      if (userError || !targetUser) {
        throw new Error('User not found');
      }

      const { data: list, error: listError } = await supabaseAdmin
        .from('custom_lists')
        .select('user_id')
        .eq('id', listId)
        .single();

      if (listError || !list) {
        throw new Error('List not found');
      }

      if (list.user_id === targetUser.id) {
        throw new Error('Cannot add list owner as collaborator');
      }

      const { data: existing } = await supabaseAdmin
        .from('list_collaborators')
        .select('id')
        .eq('list_id', listId)
        .eq('user_id', targetUser.id)
        .single();

      if (existing) {
        throw new Error('User is already a collaborator');
      }

      const { error: insertError } = await supabaseAdmin
        .from('list_collaborators')
        .insert({
          list_id: listId,
          user_id: targetUser.id,
          role,
          added_by: addedBy,
        });

      if (insertError) {
        logger.error('Error adding collaborator:', insertError);
        throw new Error('Failed to add collaborator');
      }
    } catch (error) {
      logger.error('Add collaborator error:', error);
      throw error;
    }
  }

  async removeCollaborator(listId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabaseAdmin
        .from('list_collaborators')
        .delete()
        .eq('list_id', listId)
        .eq('user_id', userId);

      if (error) {
        logger.error('Error removing collaborator:', error);
        throw new Error('Failed to remove collaborator');
      }
    } catch (error) {
      logger.error('Remove collaborator error:', error);
      throw error;
    }
  }

  async updateCollaboratorRole(
    listId: string,
    userId: string,
    role: CollaboratorRole
  ): Promise<void> {
    try {
      const { error } = await supabaseAdmin
        .from('list_collaborators')
        .update({ role })
        .eq('list_id', listId)
        .eq('user_id', userId);

      if (error) {
        logger.error('Error updating collaborator role:', error);
        throw new Error('Failed to update collaborator role');
      }
    } catch (error) {
      logger.error('Update collaborator role error:', error);
      throw error;
    }
  }

  async inviteCollaborator(
    listId: string,
    username: string,
    role: CollaboratorRole,
    inviterId: string
  ): Promise<void> {
    try {
      const { data: targetUser, error: userError } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('username', username)
        .single();

      if (userError || !targetUser) {
        throw new Error('User not found');
      }

      if (targetUser.id === inviterId) {
        throw new Error('Cannot invite yourself');
      }

      const { data: list, error: listError } = await supabaseAdmin
        .from('custom_lists')
        .select('user_id')
        .eq('id', listId)
        .single();

      if (listError || !list) {
        throw new Error('List not found');
      }

      if (list.user_id === targetUser.id) {
        throw new Error('Cannot invite list owner');
      }

      const { data: existingCollaborator } = await supabaseAdmin
        .from('list_collaborators')
        .select('id')
        .eq('list_id', listId)
        .eq('user_id', targetUser.id)
        .single();

      if (existingCollaborator) {
        throw new Error('User is already a collaborator');
      }

      const { data: pendingInvitation } = await supabaseAdmin
        .from('list_invitations')
        .select('id')
        .eq('list_id', listId)
        .eq('invitee_id', targetUser.id)
        .eq('status', 'pending')
        .single();

      if (pendingInvitation) {
        throw new Error('User already has a pending invitation');
      }

      const { error: insertError } = await supabaseAdmin
        .from('list_invitations')
        .insert({
          list_id: listId,
          inviter_id: inviterId,
          invitee_id: targetUser.id,
          role,
        });

      if (insertError) {
        logger.error('Error creating invitation:', insertError);
        throw new Error('Failed to send invitation');
      }
    } catch (error) {
      logger.error('Invite collaborator error:', error);
      throw error;
    }
  }

  async getUserInvitations(userId: string): Promise<InvitationWithDetails[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('list_invitations')
        .select(`
          *,
          inviter:inviter_id (
            id,
            username,
            display_name,
            avatar_url
          ),
          list:list_id (
            id,
            name,
            description,
            cover_image_url
          )
        `)
        .eq('invitee_id', userId)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching invitations:', error);
        throw new Error('Failed to fetch invitations');
      }

      return data as InvitationWithDetails[];
    } catch (error) {
      logger.error('Get user invitations error:', error);
      throw error;
    }
  }

  async respondToInvitation(
    invitationId: string,
    userId: string,
    accept: boolean
  ): Promise<void> {
    try {
      const { data: invitation, error: invError } = await supabaseAdmin
        .from('list_invitations')
        .select('*')
        .eq('id', invitationId)
        .eq('invitee_id', userId)
        .eq('status', 'pending')
        .single();

      if (invError || !invitation) {
        throw new Error('Invitation not found or already processed');
      }

      if (new Date(invitation.expires_at) < new Date()) {
        throw new Error('Invitation has expired');
      }

      const newStatus = accept ? 'accepted' : 'rejected';

      const { error: updateError } = await supabaseAdmin
        .from('list_invitations')
        .update({ status: newStatus })
        .eq('id', invitationId);

      if (updateError) {
        logger.error('Error updating invitation:', updateError);
        throw new Error('Failed to update invitation');
      }

      if (accept) {
        const { error: collaboratorError } = await supabaseAdmin
          .from('list_collaborators')
          .insert({
            list_id: invitation.list_id,
            user_id: userId,
            role: invitation.role,
            added_by: invitation.inviter_id,
          });

        if (collaboratorError) {
          logger.error('Error adding collaborator after acceptance:', collaboratorError);
          throw new Error('Failed to add collaborator');
        }
      }
    } catch (error) {
      logger.error('Respond to invitation error:', error);
      throw error;
    }
  }

  async cancelInvitation(invitationId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabaseAdmin
        .from('list_invitations')
        .delete()
        .eq('id', invitationId)
        .eq('inviter_id', userId)
        .eq('status', 'pending');

      if (error) {
        logger.error('Error canceling invitation:', error);
        throw new Error('Failed to cancel invitation');
      }
    } catch (error) {
      logger.error('Cancel invitation error:', error);
      throw error;
    }
  }

  async generateShareCode(listId: string): Promise<string> {
    try {
      const { data, error } = await supabaseAdmin.rpc('generate_share_code');

      if (error) {
        logger.error('Error generating share code:', error);
        throw new Error('Failed to generate share code');
      }

      const shareCode = data as string;

      const { error: updateError } = await supabaseAdmin
        .from('custom_lists')
        .update({ share_code: shareCode })
        .eq('id', listId);

      if (updateError) {
        logger.error('Error updating share code:', updateError);
        throw new Error('Failed to update share code');
      }

      return shareCode;
    } catch (error) {
      logger.error('Generate share code error:', error);
      throw error;
    }
  }

  async getListByShareCode(shareCode: string) {
    try {
      const { data, error } = await supabaseAdmin
        .from('custom_lists')
        .select(`
          *,
          user:user_id (
            id,
            username,
            display_name,
            avatar_url
          ),
          items:custom_list_items (
            id,
            position,
            notes,
            media:media_id (
              id,
              title,
              type,
              poster_path,
              release_date
            )
          )
        `)
        .eq('share_code', shareCode)
        .eq('is_public', true)
        .single();

      if (error || !data) {
        throw new Error('List not found or not public');
      }

      return data;
    } catch (error) {
      logger.error('Get list by share code error:', error);
      throw error;
    }
  }

  async checkUserPermission(
    listId: string,
    userId: string
  ): Promise<{ isOwner: boolean; role: CollaboratorRole | null }> {
    try {
      const { data: list } = await supabaseAdmin
        .from('custom_lists')
        .select('user_id')
        .eq('id', listId)
        .single();

      if (list?.user_id === userId) {
        return { isOwner: true, role: 'admin' };
      }

      const { data: collaborator } = await supabaseAdmin
        .from('list_collaborators')
        .select('role')
        .eq('list_id', listId)
        .eq('user_id', userId)
        .single();

      return {
        isOwner: false,
        role: collaborator?.role || null,
      };
    } catch (error) {
      logger.error('Check user permission error:', error);
      return { isOwner: false, role: null };
    }
  }
}

export const collaboratorService = new CollaboratorService();
