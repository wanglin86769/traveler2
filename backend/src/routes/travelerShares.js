const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const travelerSharesController = require('../controllers/travelerShares');

// Share routes for travelers
router.get('/:id/share', authenticate, travelerSharesController.getTravelerSharing);
router.put('/:id/share/public', authenticate, travelerSharesController.updatePublicAccess);
router.post('/:id/share/users', authenticate, travelerSharesController.addUserToShare);
router.put('/:id/share/users/:userId', authenticate, travelerSharesController.updateUserShareAccess);
router.delete('/:id/share/users/:userId', authenticate, travelerSharesController.removeUserFromShare);
router.post('/:id/share/groups', authenticate, travelerSharesController.addGroupToShare);
router.put('/:id/share/groups/:groupId', authenticate, travelerSharesController.updateGroupShareAccess);
router.delete('/:id/share/groups/:groupId', authenticate, travelerSharesController.removeGroupFromShare);

module.exports = router;