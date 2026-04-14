const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const formfilesController = require('../controllers/formfiles');

// Remove authentication middleware for file access - static images, low risk
router.get('/:id/file', formfilesController.getFormFile);

router.get('/:id', authenticate, formfilesController.getFormFileContent);

module.exports = router;