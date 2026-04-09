const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const ApiError = require('../utils/ApiError');
const groupsController = require('../controllers/groups');

router.get('/', authenticate, groupsController.getAllGroups);

router.get('/:id', authenticate, groupsController.getGroupById);

router.post('/', authenticate, authorize('admin', 'manager'), [
  body('name').notEmpty().withMessage('Name is required')
], validateRequest, groupsController.createGroup);

router.put('/:id', authenticate, authorize('admin', 'manager'), groupsController.updateGroup);

router.post('/:id/members', authenticate, authorize('admin', 'manager'), groupsController.addGroupMember);

router.delete('/:id/members/:userId', authenticate, authorize('admin', 'manager'), groupsController.removeGroupMember);

router.delete('/:id', authenticate, authorize('admin'), groupsController.deleteGroup);

module.exports = router;
