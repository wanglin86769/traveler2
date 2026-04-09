const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const releasedFormsController = require('../controllers/releasedForms');

router.get('/', authenticate, releasedFormsController.getAllReleasedForms);

router.get('/:id', authenticate, releasedFormsController.getReleasedFormById);

router.put('/:id/archive', authenticate, releasedFormsController.archiveReleasedForm);

module.exports = router;
