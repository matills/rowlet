import { Router } from 'express';
import { customListController } from '../controllers/custom-list.controller';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  CreateCustomListSchema,
  UpdateCustomListSchema,
  AddListItemSchema,
  UpdateListItemSchema,
} from '../validators/custom-list.validators';

const router = Router();

/**
 * @route GET /api/v1/lists
 * @desc Get all lists for current user
 * @access Private
 */
router.get('/', authenticate, (req, res) =>
  customListController.getMyLists(req, res)
);

/**
 * @route POST /api/v1/lists
 * @desc Create a new custom list
 * @access Private
 */
router.post(
  '/',
  authenticate,
  validate(CreateCustomListSchema),
  (req, res) => customListController.createList(req, res)
);

/**
 * @route GET /api/v1/lists/:id
 * @desc Get a specific list by ID (public or owned)
 * @access Public (if list is public) / Private (if list is private and you own it)
 */
router.get('/:id', (req, res) => customListController.getListById(req, res));

/**
 * @route PUT /api/v1/lists/:id
 * @desc Update a custom list
 * @access Private (must own the list)
 */
router.put(
  '/:id',
  authenticate,
  validate(UpdateCustomListSchema),
  (req, res) => customListController.updateList(req, res)
);

/**
 * @route DELETE /api/v1/lists/:id
 * @desc Delete a custom list
 * @access Private (must own the list)
 */
router.delete('/:id', authenticate, (req, res) =>
  customListController.deleteList(req, res)
);

/**
 * @route POST /api/v1/lists/:id/items
 * @desc Add item to list
 * @access Private (must own the list)
 */
router.post(
  '/:id/items',
  authenticate,
  validate(AddListItemSchema),
  (req, res) => customListController.addItemToList(req, res)
);

/**
 * @route PUT /api/v1/lists/:id/items/:mediaId
 * @desc Update list item (position or notes)
 * @access Private (must own the list)
 */
router.put(
  '/:id/items/:mediaId',
  authenticate,
  validate(UpdateListItemSchema),
  (req, res) => customListController.updateListItem(req, res)
);

/**
 * @route DELETE /api/v1/lists/:id/items/:mediaId
 * @desc Remove item from list
 * @access Private (must own the list)
 */
router.delete('/:id/items/:mediaId', authenticate, (req, res) =>
  customListController.removeItemFromList(req, res)
);

/**
 * @route PUT /api/v1/lists/:id/reorder
 * @desc Reorder all items in a list
 * @body { itemIds: string[] } - Array of media IDs in new order
 * @access Private (must own the list)
 */
router.put('/:id/reorder', authenticate, (req, res) =>
  customListController.reorderList(req, res)
);

export default router;
