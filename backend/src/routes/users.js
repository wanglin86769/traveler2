const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const ApiError = require('../utils/ApiError');
const usersController = require('../controllers/users');

router.get('/', authenticate, usersController.getAllUsers);

router.get('/:id', authenticate, usersController.getUserById);

router.put('/:id', authenticate, usersController.updateUser);

router.put('/:id/roles', authenticate, authorize('admin'), [
  body('roles').isArray().withMessage('Roles must be an array')
], validateRequest, usersController.updateUserRoles);

router.delete('/:id', authenticate, authorize('admin'), usersController.deactivateUser);

module.exports = router;
