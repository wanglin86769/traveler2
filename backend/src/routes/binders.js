const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const ApiError = require('../utils/ApiError');
const bindersController = require('../controllers/binders');

// Category routes (must come before /:id route)
router.get('/my', authenticate, bindersController.getMyBinders);
router.get('/transferred', authenticate, bindersController.getTransferredBinders);
router.get('/shared', authenticate, bindersController.getSharedBinders);
router.get('/group-shared', authenticate, bindersController.getGroupSharedBinders);
router.get('/archived', authenticate, bindersController.getArchivedBinders);
router.get('/public', authenticate, bindersController.getPublicBinders);

// Batch transfer ownership route (must come before /:id route)
router.put('/transfer', authenticate, [
  body('binderIds').isArray({ min: 1 }).withMessage('At least one binder ID is required'),
  body('userId').notEmpty().withMessage('User ID is required')
], validateRequest, bindersController.transferOwnership);

// Basic routes
router.get('/', authenticate, bindersController.getAllBinders);
router.get('/writable', authenticate, bindersController.getWritableBinders);

// Detail and CRUD routes
router.get('/:id', authenticate, bindersController.getBinderById);

// Works routes
router.get('/:id/works', authenticate, bindersController.getBinderWorks);
router.delete('/:id/works/:workId', authenticate, bindersController.removeWorkFromBinder);

router.post('/', authenticate, [
  body('title').notEmpty().withMessage('Title is required')
], validateRequest, bindersController.createBinder);

router.post('/:id', authenticate, bindersController.addWorksToBinder);

router.put('/:id', authenticate, bindersController.updateBinder);

router.put('/:id/status', authenticate, [
  body('status').isIn([0, 1, 2, 3]).withMessage('Invalid status')
], validateRequest, bindersController.updateBinderStatus);

router.put('/:id/archive', authenticate, bindersController.archiveBinder);

router.put('/:id/dearchive', authenticate, bindersController.dearchiveBinder);

router.delete('/:id', authenticate, bindersController.deleteBinder);

module.exports = router;
