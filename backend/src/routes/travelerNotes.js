const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const travelerNotesController = require('../controllers/travelerNotes');

router.post('/:id/notes', authenticate, travelerNotesController.submitTravelerNote);

router.put('/:id/notes/:noteId', authenticate, travelerNotesController.updateTravelerNote);

router.delete('/:id/notes/:noteId', authenticate, travelerNotesController.deleteTravelerNote);

module.exports = router;