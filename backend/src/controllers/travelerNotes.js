const mongoose = require('mongoose');
const { Traveler } = require('../models/Traveler');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

const submitTravelerNote = async (req, res, next) => {
  try {
    const traveler = await Traveler.findById(req.params.id);

    if (!traveler) {
      throw new ApiError(404, 'Traveler not found');
    }

    const { name, value } = req.body;

    if (!name) {
      throw new ApiError(400, 'Name is required');
    }

    const TravelerNote = mongoose.model('TravelerNote');
    const note = new TravelerNote({
      traveler: traveler._id,
      name: name,
      value: value,
      inputBy: req.user._id,
      updatedBy: req.user._id,
      inputOn: Date.now(),
      updatedOn: Date.now()
    });

    await note.save();

    if (!traveler.notes) {
      traveler.notes = [];
    }
    traveler.notes.push(note._id);

    traveler.updatedBy = req.user._id;
    traveler.updatedOn = Date.now();

    await traveler.save();

    res.json(note);
  } catch (error) {
    next(error);
  }
};

const updateTravelerNote = async (req, res, next) => {
  try {
    const { value } = req.body;

    if (!value) {
      throw new ApiError(400, 'Value is required');
    }

    const TravelerNote = mongoose.model('TravelerNote');
    const note = await TravelerNote.findById(req.params.noteId);

    if (!note) {
      throw new ApiError(404, 'Note not found');
    }

    note.value = value;
    note.updatedBy = req.user._id;
    note.updatedOn = Date.now();
    await note.save();

    res.json(note);
  } catch (error) {
    next(error);
  }
};

const deleteTravelerNote = async (req, res, next) => {
  try {
    const noteId = req.params.noteId;

    const TravelerNote = mongoose.model('TravelerNote');
    const note = await TravelerNote.findById(noteId);

    if (!note) {
      throw new ApiError(404, 'Note not found');
    }

    const traveler = await Traveler.findById(note.traveler);
    if (traveler && traveler.notes) {
      traveler.notes = traveler.notes.filter(id => id.toString() !== noteId);
      await traveler.save();
    }

    await TravelerNote.findByIdAndDelete(noteId);

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitTravelerNote,
  updateTravelerNote,
  deleteTravelerNote
};