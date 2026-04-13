const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const ApiError = require('../utils/ApiError');
const formsController = require('../controllers/forms');

router.get('/draft', authenticate, formsController.getDraftForms);

router.get('/transferred', authenticate, formsController.getTransferredForms);

router.get('/shared', authenticate, formsController.getSharedFormsList);

router.get('/group-shared', authenticate, formsController.getGroupSharedFormsList);

router.get('/under-review', authenticate, formsController.getUnderReviewForms);

router.get('/closed', authenticate, formsController.getClosedForms);

router.get('/archived', authenticate, formsController.getArchivedForms);

router.get('/', authenticate, formsController.getAllForms);

router.put('/transfer', authenticate, [
  body('formIds').isArray({ min: 1 }).withMessage('At least one form ID is required'),
  body('userId').notEmpty().withMessage('User ID is required')
], validateRequest, formsController.transferOwnership);

router.get('/:id', authenticate, formsController.getFormById);

router.post('/', authenticate, [
  body('title').notEmpty().withMessage('Title is required')
], validateRequest, formsController.createForm);

router.put('/:id', authenticate, formsController.updateForm);

router.post('/:id/release', authenticate, formsController.releaseForm);

router.post('/:id/clone', authenticate, formsController.cloneForm);

router.put('/:id/archive', authenticate, formsController.archiveForm);

router.post('/:id/uploads', authenticate, formsController.imageUpload.single('file'), formsController.uploadFormImage);


module.exports = router;
