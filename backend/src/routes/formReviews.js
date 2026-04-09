const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const formReviewsController = require('../controllers/formReviews');

// Reviewer's pending reviews routes (specific routes first)
router.get('/my-reviews', authenticate, formReviewsController.getMyReviews);

// Form review management routes (parameterized routes)
router.put('/:id/submit-review', authenticate, formReviewsController.submitFormForReview);

router.get('/:id/review', authenticate, formReviewsController.getFormReviewInfo);

router.post('/:id/review/requests', authenticate, formReviewsController.addReviewerToForm);

router.delete('/:id/review/requests/:requestId', authenticate, formReviewsController.removeReviewerFromForm);

router.post('/:id/review/results', authenticate, formReviewsController.submitReviewResult);

module.exports = router;