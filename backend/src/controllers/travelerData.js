const { Traveler, TravelerData } = require('../models/Traveler');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs');
const config = require('../config');

// File upload related utility functions
const { getUploadDir, generateFilename, getFilePath } = require('../utils/storage');

const getTravelerData = async (req, res, next) => {
  try {
    const traveler = await Traveler.findById(req.params.id)
      .populate('notes');

    if (!traveler) {
      throw new ApiError(404, 'Traveler not found');
    }

    const allTravelerData = await TravelerData.find({ traveler: traveler._id })
      .sort({ inputOn: -1 })
      .lean();

    const result = allTravelerData;

    res.json({
      data: result || [],
      notes: traveler.notes || []
    });
  } catch (error) {
    next(error);
  }
};

const submitTravelerData = async (req, res, next) => {
  try {
    const traveler = await Traveler.findById(req.params.id);

    if (!traveler) {
      throw new ApiError(404, 'Traveler not found');
    }

    // Check if there is file upload
    if (req.file) {
      // File upload handling
      const { name, inputType } = req.body;
      const uploadDate = new Date();

      if (!name) {
        throw new ApiError(400, 'Name is required');
      }

      const dataRecord = new TravelerData({
        traveler: traveler._id,
        name,
        value: req.file.originalname,
        inputType: inputType || 'file',
        inputBy: req.user._id,
        inputOn: Date.now(),
        file: {
          path: getFilePath(req.file.filename, uploadDate),
          uploadDate: uploadDate,
          encoding: req.file.encoding,
          mimetype: req.file.mimetype,
          size: req.file.size,
          originalname: req.file.originalname
        }
      });

      await dataRecord.save();

      if (!traveler.data) {
        traveler.data = [];
      }
      traveler.data.push(dataRecord._id);

      if (!traveler.touchedInputs) {
        traveler.touchedInputs = [];
      }
      if (!traveler.touchedInputs.includes(name)) {
        traveler.touchedInputs.push(name);
      }
      traveler.finishedInput = traveler.touchedInputs.length;

      traveler.updatedBy = req.user._id;
      traveler.updatedOn = Date.now();

      await traveler.save();

      res.status(201).json(dataRecord);
    } else {
      // Text data processing
      const { name, value, inputType } = req.body;

      if (!name) {
        throw new ApiError(400, 'Name is required');
      }

      const dataRecord = new TravelerData({
        traveler: traveler._id,
        name,
        value,
        inputType: inputType || 'text',
        inputBy: req.user._id,
        inputOn: Date.now()
      });

      await dataRecord.save();

      if (!traveler.data) {
        traveler.data = [];
      }
      traveler.data.push(dataRecord._id);

      if (!traveler.touchedInputs) {
        traveler.touchedInputs = [];
      }
      if (!traveler.touchedInputs.includes(name)) {
        traveler.touchedInputs.push(name);
      }
      traveler.finishedInput = traveler.touchedInputs.length;

      traveler.updatedBy = req.user._id;
      traveler.updatedOn = Date.now();

      await traveler.save();

      res.json(dataRecord);
    }
  } catch (error) {
    next(error);
  }
};

const downloadTravelerDataFile = async (req, res, next) => {
  try {
    const travelerId = req.params.id;
    const dataId = req.params.dataId;

    // Find traveler
    const traveler = await Traveler.findById(travelerId);
    if (!traveler) {
      throw new ApiError(404, 'Traveler not found');
    }

    // Verify user permissions
    const isOwner = traveler.createdBy && traveler.createdBy.toString() === req.user._id.toString();
    const isShared = traveler.sharedWith && traveler.sharedWith.includes(req.user._id.toString());
    const isAdmin = req.user.roles && req.user.roles.includes('admin');

    if (!isOwner && !isShared && !isAdmin) {
      throw new ApiError(403, 'Access denied');
    }

    // Find TravelerData
    const data = await TravelerData.findById(dataId);
    if (!data) {
      throw new ApiError(404, 'Data record not found');
    }

    // Verify data belongs to this traveler
    if (data.traveler.toString() !== travelerId) {
      throw new ApiError(403, 'Data does not belong to this traveler');
    }

    // Verify it is a file type
    if (data.inputType !== 'file' || !data.file) {
      throw new ApiError(400, 'Not a file record');
    }

    // Build complete file path
    const filePath = path.join(config.upload.dir, data.file.path);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new ApiError(404, 'File not found on disk');
    }

    // Download file
    res.download(filePath, data.file.originalname);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTravelerData,
  submitTravelerData,
  downloadTravelerDataFile
};