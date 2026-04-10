const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const ApiError = require('../utils/ApiError');
const groupsController = require('../controllers/groups');

router.get('/', authenticate, groupsController.getAllGroups);

router.get('/:id', authenticate, groupsController.getGroupById);

router.post('/', authenticate, authorize('admin'), [
  body('_id').notEmpty().withMessage('Group ID is required'),
  body('name').notEmpty().withMessage('Name is required')
], validateRequest, groupsController.createGroup);

router.put('/:id', authenticate, authorize('admin'), groupsController.updateGroup);

router.post('/:id/members', authenticate, authorize('admin'), groupsController.addGroupMember);

router.delete('/:id/members/:userId', authenticate, authorize('admin'), groupsController.removeGroupMember);

router.delete('/:id', authenticate, authorize('admin'), groupsController.deleteGroup);

module.exports = router;
