const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const travelersController = require('../controllers/traveler');

router.get('/', authenticate, travelersController.getAllTravelers);

router.post('/', authenticate, travelersController.createTraveler);

router.get('/:id', authenticate, travelersController.getTravelerById);

router.put('/:id', authenticate, travelersController.updateTraveler);

router.delete('/:id', authenticate, travelersController.deleteTraveler);

router.put('/:id/archive', authenticate, travelersController.archiveTraveler);

router.put('/:id/status', authenticate, travelersController.updateTravelerStatus);

module.exports = router;