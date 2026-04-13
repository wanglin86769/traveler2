const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const formSharesController = require('../controllers/formShares');

// Share routes for forms
router.get('/:id/share', authenticate, formSharesController.getFormSharing);
router.put('/:id/share/public', authenticate, formSharesController.updatePublicAccess);
router.post('/:id/share/users', authenticate, formSharesController.addUserToShare);
router.put('/:id/share/users/:userId', authenticate, formSharesController.updateUserShareAccess);
router.delete('/:id/share/users/:userId', authenticate, formSharesController.removeUserFromShare);
router.post('/:id/share/groups', authenticate, formSharesController.addGroupToShare);
router.put('/:id/share/groups/:groupId', authenticate, formSharesController.updateGroupShareAccess);
router.delete('/:id/share/groups/:groupId', authenticate, formSharesController.removeGroupFromShare);

module.exports = router;