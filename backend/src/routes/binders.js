const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const ApiError = require('../utils/ApiError');
const bindersController = require('../controllers/binders');

router.get('/', authenticate, bindersController.getAllBinders);

router.get('/:id', authenticate, bindersController.getBinderById);

router.post('/', authenticate, [
  body('title').notEmpty().withMessage('Title is required')
], validateRequest, bindersController.createBinder);

router.put('/:id/status', authenticate, [
  body('status').isIn([0, 1, 2, 3]).withMessage('Invalid status')
], validateRequest, bindersController.updateBinderStatus);

router.put('/:id/archive', authenticate, bindersController.archiveBinder);

module.exports = router;
