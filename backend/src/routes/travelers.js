const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const travelersController = require('../controllers/traveler');

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

// Legacy routes for backward compatibility
router.get('/', authenticate, travelersController.getAllTravelers);

router.post('/', authenticate, travelersController.createTraveler);

router.get('/:id', authenticate, travelersController.getTravelerById);

router.put('/:id', authenticate, travelersController.updateTraveler);

router.delete('/:id', authenticate, travelersController.deleteTraveler);

router.put('/:id/archive', authenticate, travelersController.archiveTraveler);

router.put('/:id/status', authenticate, travelersController.updateTravelerStatus);

module.exports = router;