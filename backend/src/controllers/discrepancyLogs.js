const { Traveler, Log } = require('../models/Traveler');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs');
const config = require('../config');

// File upload related utility functions
const { getUploadDir, generateFilename, getFilePath } = require('../utils/storage');
const { discrepancyUpload } = require('../middleware/upload');

const createDiscrepancyLog = async (req, res, next) => {
  try {
    const traveler = await Traveler.findById(req.params.id);

    if (!traveler) {
      throw new ApiError(404, 'Traveler not found');
    }

    const isOwner = traveler.createdBy.toString() === req.user._id.toString();
    const isShared = traveler.sharedWith && traveler.sharedWith.includes(req.user._id.toString());
    if (!isOwner && !isShared) {
      throw new ApiError(403, 'Not authorized to access this traveler');
    }

    if (!traveler.discrepancyForm) {
      throw new ApiError(400, 'This traveler does not have a discrepancy form');
    }

    const log = new Log({
      referenceForm: traveler.referenceDiscrepancyForm,
      records: [],
      inputBy: req.user._id,
      inputOn: Date.now()
    });

    await log.save();

    traveler.discrepancyLogs.push(log._id);
    await traveler.save();

    res.status(201).json({
      message: 'Discrepancy log created successfully',
      ...log.toObject()
    });
  } catch (error) {
    next(error);
  }
};

const submitDiscrepancyLog = async (req, res, next) => {
  try {
    const traveler = await Traveler.findById(req.params.id);

    if (!traveler) {
      throw new ApiError(404, 'Traveler not found');
    }

    const isOwner = traveler.createdBy.toString() === req.user._id.toString();
    const isShared = traveler.sharedWith && traveler.sharedWith.includes(req.user._id.toString());
    if (!isOwner && !isShared) {
      throw new ApiError(403, 'Not authorized to access this traveler');
    }

    if (!traveler.discrepancyForm) {
      throw new ApiError(400, 'This traveler does not have a discrepancy form');
    }

    const log = new Log({
      referenceForm: traveler.referenceDiscrepancyForm,
      records: [],
      inputBy: req.user._id,
      inputOn: Date.now()
    });

    const uploadDate = new Date();

    if (req.files) {
      const files = Array.isArray(req.files) ? req.files : Object.values(req.files);

      files.forEach((file) => {
        const relativePath = getFilePath(file.filename, uploadDate);

        log.records.push({
          name: file.fieldname,
          value: file.originalname,
          file: {
            path: relativePath,
            uploadDate: uploadDate,
            encoding: file.encoding,
            mimetype: file.mimetype
          }
        });
      });
    }

    const extractFieldNames = (elements) => {
      const names = [];
      elements.forEach((element) => {
        if (element.type === 'section' && element.json && Array.isArray(element.json)) {
          names.push(...extractFieldNames(element.json));
        } else if (element.name) {
          names.push(element.name);
        }
      });
      return names;
    };

    const allowedFieldNames = [];
    if (traveler.discrepancyForm?.json && Array.isArray(traveler.discrepancyForm.json)) {
      allowedFieldNames.push(...extractFieldNames(traveler.discrepancyForm.json));
    }

    for (const [name, value] of Object.entries(req.body)) {
      if (name === 'records') continue;

      if (value === undefined || value === null || value === '') continue;

      if (allowedFieldNames.includes(name)) {
        log.records.push({
          name,
          value
        });
      }
    }

    await log.save();

    traveler.discrepancyLogs.push(log._id);
    await traveler.save();

    res.status(201).json({
      message: 'Discrepancy log submitted successfully',
      ...log.toObject()
    });
  } catch (error) {
    next(error);
  }
};

const getDiscrepancyLogs = async (req, res, next) => {
  try {
    const traveler = await Traveler.findById(req.params.id);

    if (!traveler) {
      throw new ApiError(404, 'Traveler not found');
    }

    const isOwner = traveler.createdBy.toString() === req.user._id.toString();
    const isShared = traveler.sharedWith && traveler.sharedWith.includes(req.user._id.toString());
    if (!isOwner && !isShared) {
      throw new ApiError(403, 'Not authorized to access this traveler');
    }

    const logs = await Log.find({
      _id: { $in: traveler.discrepancyLogs }
    }).sort({ inputOn: -1 });

    res.json({ data: logs });
  } catch (error) {
    next(error);
  }
};

const addLogRecords = async (req, res, next) => {
  try {
    const traveler = await Traveler.findById(req.params.id);
    const log = await Log.findById(req.params.lid);

    if (!traveler) {
      throw new ApiError(404, 'Traveler not found');
    }

    if (!log) {
      throw new ApiError(404, 'Log not found');
    }

    const isOwner = traveler.createdBy.toString() === req.user._id.toString();
    const isShared = traveler.sharedWith && traveler.sharedWith.includes(req.user._id.toString());
    if (!isOwner && !isShared) {
      throw new ApiError(403, 'Not authorized to access this traveler');
    }

    if (!traveler.discrepancyLogs.includes(log._id)) {
      throw new ApiError(400, 'Log does not belong to this traveler');
    }

    if (req.files) {
      for (const [name, file] of Object.entries(req.files)) {
        const filePath = `/uploads/${file.name}`;
        log.records.push({
          name,
          value: filePath,
          inputType: 'file',
          inputOn: Date.now()
        });
      }
    }

    const { records } = req.body;
    if (records) {
      if (typeof records === 'string') {
        try {
          const parsedRecords = JSON.parse(records);
          for (const [name, value] of Object.entries(parsedRecords)) {
            log.records.push({
              name,
              value,
              inputType: 'text',
              inputOn: Date.now()
            });
          }
        } catch (e) {
          log.records.push({
            name: 'data',
            value: records,
            inputType: 'text',
            inputOn: Date.now()
          });
        }
      } else if (typeof records === 'object') {
        for (const [name, value] of Object.entries(records)) {
          log.records.push({
            name,
            value,
            inputType: 'text',
            inputOn: Date.now()
          });
        }
      }
    }

    await log.save();

    res.json({
      message: 'Records added successfully',
      ...log.toObject()
    });
  } catch (error) {
    next(error);
  }
};

const downloadDiscrepancyLogFile = async (req, res, next) => {
  try {
    const travelerId = req.params.id;
    const logId = req.params.lid;
    const recordId = req.params.rid;

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

    // Find log
    const log = await Log.findById(logId);
    if (!log) {
      throw new ApiError(404, 'Log not found');
    }

    // Verify log belongs to this traveler
    if (!traveler.discrepancyLogs.includes(log._id)) {
      throw new ApiError(403, 'Log does not belong to this traveler');
    }

    // Find record
    const record = log.records.id(recordId);
    if (!record) {
      throw new ApiError(404, 'Record not found');
    }

    // Verify it is a file type
    if (!record.file) {
      throw new ApiError(400, 'Not a file record');
    }

    // Build complete file path
    const filePath = path.join(config.upload.dir, record.file.path);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new ApiError(404, 'File not found on disk');
    }

    // Download file
    res.download(filePath, record.value);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDiscrepancyLog,
  submitDiscrepancyLog,
  getDiscrepancyLogs,
  addLogRecords,
  discrepancyUpload,
  downloadDiscrepancyLogFile
};