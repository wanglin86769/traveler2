const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const ApiError = require('../utils/ApiError');
const usersController = require('../controllers/users');

// All users can view
router.get('/', authenticate, usersController.getAllUsers);

// Only admin can create
router.post('/', authenticate, authorize('admin'), [
  body('_id').notEmpty().withMessage('Username is required'),
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required')
], validateRequest, usersController.createUser);

// All users can view
router.get('/:id', authenticate, usersController.getUserById);

// Only admin can update
router.put('/:id', authenticate, authorize('admin'), usersController.updateUser);

// Only admin can delete
router.delete('/:id', authenticate, authorize('admin'), usersController.deleteUser);

// Only admin can reset password
router.put('/:id/reset-password', authenticate, authorize('admin'), [
  body('password').notEmpty().withMessage('Password is required')
], validateRequest, usersController.resetPassword);

module.exports = router;
