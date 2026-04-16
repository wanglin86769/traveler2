const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const binderSharesController = require('../controllers/binderShares');

// Share routes for binders
router.get('/:id/share', authenticate, binderSharesController.getBinderSharing);
router.put('/:id/share/public', authenticate, binderSharesController.updatePublicAccess);
router.post('/:id/share/users', authenticate, binderSharesController.addUserToShare);
router.put('/:id/share/users/:userId', authenticate, binderSharesController.updateUserShareAccess);
router.delete('/:id/share/users/:userId', authenticate, binderSharesController.removeUserFromShare);
router.post('/:id/share/groups', authenticate, binderSharesController.addGroupToShare);
router.put('/:id/share/groups/:groupId', authenticate, binderSharesController.updateGroupShareAccess);
router.delete('/:id/share/groups/:groupId', authenticate, binderSharesController.removeGroupFromShare);

module.exports = router;