const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const formfilesController = require('../controllers/formfiles');

router.get('/:id/file', authenticate, formfilesController.getFormFile);

router.get('/:id', authenticate, formfilesController.getFormFileContent);

module.exports = router;