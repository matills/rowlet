import { Response } from 'express';
import { collaboratorService } from '../services/collaborator.service';
import { logger } from '../config/logger';
import type { AuthRequest } from '../middlewares/auth';
import type {
  AddCollaboratorInput,
  UpdateCollaboratorRoleInput,
  InviteCollaboratorInput,
  RespondInvitationInput,
} from '../validators/collaborator.validators';

export class CollaboratorController {
  async getListCollaborators(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { listId } = req.params;

      const collaborators = await collaboratorService.getListCollaborators(listId);

      res.status(200).json({
        message: 'Collaborators retrieved successfully',
        collaborators,
      });
    } catch (error: any) {
      logger.error('Get list collaborators controller error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch collaborators',
      });
    }
  }

  async addCollaborator(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      const { listId } = req.params;
      const data: AddCollaboratorInput = req.body;

      await collaboratorService.addCollaborator(
        listId,
        data.username,
        data.role,
        req.user.id
      );

      res.status(201).json({
        message: `${data.username} added as collaborator`,
      });
    } catch (error: any) {
      logger.error('Add collaborator controller error:', error);

      if (error.message.includes('not found')) {
        res.status(404).json({
          error: 'Not Found',
          message: error.message,
        });
        return;
      }

      if (error.message.includes('already')) {
        res.status(409).json({
          error: 'Conflict',
          message: error.message,
        });
        return;
      }

      if (error.message.includes('Cannot')) {
        res.status(400).json({
          error: 'Bad Request',
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to add collaborator',
      });
    }
  }

  async removeCollaborator(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { listId, userId } = req.params;

      await collaboratorService.removeCollaborator(listId, userId);

      res.status(200).json({
        message: 'Collaborator removed successfully',
      });
    } catch (error: any) {
      logger.error('Remove collaborator controller error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to remove collaborator',
      });
    }
  }

  async updateCollaboratorRole(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { listId, userId } = req.params;
      const data: UpdateCollaboratorRoleInput = req.body;

      await collaboratorService.updateCollaboratorRole(listId, userId, data.role);

      res.status(200).json({
        message: 'Collaborator role updated successfully',
      });
    } catch (error: any) {
      logger.error('Update collaborator role controller error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update collaborator role',
      });
    }
  }

  async inviteCollaborator(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      const { listId } = req.params;
      const data: InviteCollaboratorInput = req.body;

      await collaboratorService.inviteCollaborator(
        listId,
        data.username,
        data.role,
        req.user.id
      );

      res.status(201).json({
        message: `Invitation sent to ${data.username}`,
      });
    } catch (error: any) {
      logger.error('Invite collaborator controller error:', error);

      if (error.message.includes('not found')) {
        res.status(404).json({
          error: 'Not Found',
          message: error.message,
        });
        return;
      }

      if (error.message.includes('already') || error.message.includes('pending')) {
        res.status(409).json({
          error: 'Conflict',
          message: error.message,
        });
        return;
      }

      if (error.message.includes('Cannot')) {
        res.status(400).json({
          error: 'Bad Request',
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to send invitation',
      });
    }
  }

  async getUserInvitations(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      const invitations = await collaboratorService.getUserInvitations(req.user.id);

      res.status(200).json({
        message: 'Invitations retrieved successfully',
        invitations,
      });
    } catch (error: any) {
      logger.error('Get user invitations controller error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch invitations',
      });
    }
  }

  async respondToInvitation(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      const { invitationId } = req.params;
      const data: RespondInvitationInput = req.body;

      await collaboratorService.respondToInvitation(
        invitationId,
        req.user.id,
        data.accept
      );

      res.status(200).json({
        message: data.accept
          ? 'Invitation accepted successfully'
          : 'Invitation rejected successfully',
      });
    } catch (error: any) {
      logger.error('Respond to invitation controller error:', error);

      if (error.message.includes('not found') || error.message.includes('expired')) {
        res.status(404).json({
          error: 'Not Found',
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to respond to invitation',
      });
    }
  }

  async cancelInvitation(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      const { invitationId } = req.params;

      await collaboratorService.cancelInvitation(invitationId, req.user.id);

      res.status(200).json({
        message: 'Invitation canceled successfully',
      });
    } catch (error: any) {
      logger.error('Cancel invitation controller error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to cancel invitation',
      });
    }
  }

  async generateShareCode(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { listId } = req.params;

      const shareCode = await collaboratorService.generateShareCode(listId);

      res.status(200).json({
        message: 'Share code generated successfully',
        shareCode,
        shareUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/lists/shared/${shareCode}`,
      });
    } catch (error: any) {
      logger.error('Generate share code controller error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to generate share code',
      });
    }
  }

  async getListByShareCode(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { shareCode } = req.params;

      const list = await collaboratorService.getListByShareCode(shareCode);

      res.status(200).json({
        message: 'List retrieved successfully',
        list,
      });
    } catch (error: any) {
      logger.error('Get list by share code controller error:', error);

      if (error.message.includes('not found')) {
        res.status(404).json({
          error: 'Not Found',
          message: 'List not found or not public',
        });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch list',
      });
    }
  }
}

export const collaboratorController = new CollaboratorController();
