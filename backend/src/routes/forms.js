const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const ApiError = require('../utils/ApiError');
const formsController = require('../controllers/forms');

router.get('/draft', authenticate, formsController.getDraftForms);

router.get('/under-review', authenticate, formsController.getUnderReviewForms);

router.get('/closed', authenticate, formsController.getClosedForms);

router.get('/', authenticate, formsController.getAllForms);

router.get('/:id', authenticate, formsController.getFormById);

router.post('/', authenticate, [
  body('title').notEmpty().withMessage('Title is required')
], validateRequest, formsController.createForm);

router.put('/:id', authenticate, formsController.updateForm);

router.post('/:id/release', authenticate, formsController.releaseForm);

router.post('/:id/clone', authenticate, formsController.cloneForm);

router.put('/:id/archive', authenticate, formsController.archiveForm);

router.put('/:id/share', authenticate, formsController.updateFormSharing);

router.post('/:id/uploads', authenticate, formsController.imageUpload.single('file'), formsController.uploadFormImage);


module.exports = router;
