const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const travelerDataController = require('../controllers/travelerData');
const { travelerUpload } = require('../middleware/upload');

router.get('/:id/data', authenticate, travelerDataController.getTravelerData);

// POST endpoint supporting file upload
router.post('/:id/data', authenticate, travelerUpload.single('file'), travelerDataController.submitTravelerData);

// File download endpoint
router.get('/:id/data/:dataId', authenticate, travelerDataController.downloadTravelerDataFile);

module.exports = router;