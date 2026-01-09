import { Router } from 'express';
import { collaboratorController } from '../controllers/collaborator.controller';
import { authenticate, optionalAuth } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  addCollaboratorSchema,
  updateCollaboratorRoleSchema,
  inviteCollaboratorSchema,
  respondInvitationSchema,
} from '../validators/collaborator.validators';

const router = Router();

router.get(
  '/lists/:listId/collaborators',
  authenticate,
  (req, res) => collaboratorController.getListCollaborators(req, res)
);

router.post(
  '/lists/:listId/collaborators',
  authenticate,
  validate(addCollaboratorSchema),
  (req, res) => collaboratorController.addCollaborator(req, res)
);

router.delete(
  '/lists/:listId/collaborators/:userId',
  authenticate,
  (req, res) => collaboratorController.removeCollaborator(req, res)
);

router.put(
  '/lists/:listId/collaborators/:userId/role',
  authenticate,
  validate(updateCollaboratorRoleSchema),
  (req, res) => collaboratorController.updateCollaboratorRole(req, res)
);

router.post(
  '/lists/:listId/invite',
  authenticate,
  validate(inviteCollaboratorSchema),
  (req, res) => collaboratorController.inviteCollaborator(req, res)
);

router.get(
  '/invitations',
  authenticate,
  (req, res) => collaboratorController.getUserInvitations(req, res)
);

router.post(
  '/invitations/:invitationId/respond',
  authenticate,
  validate(respondInvitationSchema),
  (req, res) => collaboratorController.respondToInvitation(req, res)
);

router.delete(
  '/invitations/:invitationId',
  authenticate,
  (req, res) => collaboratorController.cancelInvitation(req, res)
);

router.post(
  '/lists/:listId/share',
  authenticate,
  (req, res) => collaboratorController.generateShareCode(req, res)
);

router.get(
  '/lists/shared/:shareCode',
  optionalAuth,
  (req, res) => collaboratorController.getListByShareCode(req, res)
);

export default router;
