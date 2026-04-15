const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { body } = require('express-validator');
const { validateRequest } = require('../middleware/validation');
const travelersController = require('../controllers/traveler');

// Public travelers
router.get('/public', authenticate, travelersController.getPublicTravelers);

// My travelers
router.get('/my', authenticate, travelersController.getMyTravelers);

// Transferred travelers
router.get('/transferred', authenticate, travelersController.getTransferredTravelers);

// Shared travelers
router.get('/shared', authenticate, travelersController.getSharedTravelers);

// Group shared travelers
router.get('/group-shared', authenticate, travelersController.getGroupSharedTravelers);

// Archived travelers
router.get('/archived', authenticate, travelersController.getArchivedTravelers);

// Batch transfer ownership
router.put('/transfer', authenticate, [
  body('travelerIds').isArray({ min: 1 }).withMessage('At least one traveler ID is required'),
  body('userId').notEmpty().withMessage('User ID is required')
], validateRequest, travelersController.transferOwnership);

// Legacy routes for backward compatibility
router.get('/', authenticate, travelersController.getAllTravelers);

router.post('/', authenticate, travelersController.createTraveler);

router.get('/:id', authenticate, travelersController.getTravelerById);

router.put('/:id', authenticate, travelersController.updateTraveler);

router.delete('/:id', authenticate, travelersController.deleteTraveler);

router.post('/:id/clone', authenticate, travelersController.cloneTraveler);

router.put('/:id/archive', authenticate, travelersController.archiveTraveler);

router.put('/:id/status', authenticate, travelersController.updateTravelerStatus);

module.exports = router;