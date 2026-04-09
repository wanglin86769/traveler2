const mongoose = require('mongoose');
const { Traveler } = require('../models/Traveler');
const { ReleasedForm } = require('../models/ReleasedForm');
const { Log } = require('../models/Traveler');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

const getAllTravelers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status ? parseInt(req.query.status) : null;

    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (status !== null && !isNaN(status)) {
      query.status = status;
    }

    const total = await Traveler.countDocuments(query);

    const travelers = await Traveler.find(query)
      .sort({ createdOn: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({
      data: travelers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

const createTraveler = async (req, res, next) => {
  try {
    const { form } = req.body;

    if (!form) {
      throw new ApiError(400, 'Form ID is required');
    }

    const releasedForm = await ReleasedForm.findById(form);
    if (!releasedForm) {
      throw new ApiError(404, 'Released form not found');
    }

    if (releasedForm.formType &&
        releasedForm.formType !== 'normal' &&
        releasedForm.formType !== 'normal_discrepancy') {
      throw new ApiError(400, `Cannot create traveler from form of type '${releasedForm.formType}'`);
    }

    if (releasedForm.status !== 1) {
      throw new ApiError(400, `Cannot create traveler from non-released form`);
    }

    const traveler = new Traveler({
      title: releasedForm.title,
      description: '',
      devices: [],
      status: 0,
      createdBy: req.user._id,
      createdOn: Date.now(),
      sharedWith: [],
      referenceReleasedForm: releasedForm._id,
      referenceReleasedFormVer: releasedForm.ver,
      data: [],
      comments: [],
      finishedInput: 0,
      touchedInputs: []
    });

    const formBase = { ...releasedForm.base.toObject ? releasedForm.base.toObject() : releasedForm.base };
    formBase.reference = releasedForm._id;
    traveler.form = formBase;

    const isInputType = (type) => {
      const inputTypes = [
        'checkbox', 'checkbox-set', 'radio', 'text', 'paragraph',
        'number', 'file', 'dropdown', 'date', 'datetime', 'time',
        'email', 'phone', 'url'
      ];
      return inputTypes.includes(type);
    };

    if (formBase.json && Array.isArray(formBase.json)) {
      const countInputFields = (elements) => {
        let count = 0;
        elements.forEach((element) => {
          if (element.type === 'section' && element.json && Array.isArray(element.json)) {
            count += countInputFields(element.json);
          } else if (element.name && isInputType(element.type)) {
            count++;
          }
        });
        return count;
      };
      traveler.totalInput = countInputFields(formBase.json);
    }

    if (releasedForm.discrepancy) {
      traveler.discrepancyForm = releasedForm.discrepancy;
      traveler.referenceDiscrepancyForm = releasedForm.discrepancy.reference;
    }

    await traveler.save();

    res.status(201).json(traveler);
  } catch (error) {
    next(error);
  }
};

const getTravelerById = async (req, res, next) => {
  try {
    const traveler = await Traveler.findById(req.params.id)
      .populate('data')
      .populate('notes');

    if (!traveler) {
      throw new ApiError(404, 'Traveler not found');
    }

    const isOwner = traveler.createdBy.toString() === req.user._id.toString();
    const isShared = traveler.sharedWith && traveler.sharedWith.includes(req.user._id.toString());
    if (!isOwner && !isShared) {
      throw new ApiError(403, 'Not authorized to access this traveler');
    }

    let discrepancyData = {};
    if (traveler.discrepancyLogs && traveler.discrepancyLogs.length > 0) {
      const latestLogId = traveler.discrepancyLogs[traveler.discrepancyLogs.length - 1];
      const latestLog = await Log.findById(latestLogId);

      if (latestLog && traveler.discrepancyForm) {
        const extractFields = (elements) => {
          const fields = {};
          elements.forEach((element) => {
            if (element.type === 'section' && element.json && Array.isArray(element.json)) {
              Object.assign(fields, extractFields(element.json));
            } else if (element.name) {
              const record = latestLog.records.find(r => r.name === element.name);
              fields[element.name] = {
                value: record?.value || null,
                label: element.label || element.name,
                type: element.type,
                inputOn: record?.inputOn
              };
            }
          });
          return fields;
        };

        if (traveler.discrepancyForm.json && Array.isArray(traveler.discrepancyForm.json)) {
          discrepancyData = extractFields(traveler.discrepancyForm.json);
        }
      }
    }

    res.json({
      ...traveler.toObject(),
      discrepancy: discrepancyData,
      hasDiscrepancy: traveler.discrepancyLogs && traveler.discrepancyLogs.length > 0
    });
  } catch (error) {
    next(error);
  }
};

const updateTraveler = async (req, res, next) => {
  try {
    const traveler = await Traveler.findById(req.params.id);

    if (!traveler) {
      throw new ApiError(404, 'Traveler not found');
    }

    const allowedUpdates = ['title', 'description', 'status', 'devices', 'locations', 'deadline', 'tags'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        traveler[field] = req.body[field];
      }
    });

    traveler.updatedBy = req.user._id;
    traveler.updatedOn = Date.now();

    await traveler.save();

    res.json(traveler);
  } catch (error) {
    next(error);
  }
};

const deleteTraveler = async (req, res, next) => {
  try {
    const traveler = await Traveler.findById(req.params.id);

    if (!traveler) {
      throw new ApiError(404, 'Traveler not found');
    }

    await Traveler.findByIdAndDelete(req.params.id);

    res.json({ message: 'Traveler deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const archiveTraveler = async (req, res, next) => {
  try {
    const traveler = await Traveler.findById(req.params.id);

    if (!traveler) {
      throw new ApiError(404, 'Traveler not found');
    }

    const isOwner = traveler.createdBy === req.user._id ||
                    traveler.createdBy === req.user.name;
    const isAdmin = req.user.roles?.includes('admin');
    const isManager = req.user.roles?.includes('manager');

    if (!isOwner && !isAdmin && !isManager) {
      throw new ApiError(403, 'You are not authorized to archive this traveler');
    }

    if (traveler.status === 4) {
      return res.status(204).send();
    }

    traveler.status = 4;
    traveler.updatedBy = req.user._id;
    traveler.updatedOn = Date.now();

    await traveler.save();

    res.json({
      message: 'Traveler archived successfully',
      ...traveler.toObject()
    });
  } catch (error) {
    next(error);
  }
};

const updateTravelerStatus = async (req, res, next) => {
  try {
    const traveler = await Traveler.findById(req.params.id);

    if (!traveler) {
      throw new ApiError(404, 'Traveler not found');
    }

    const { status } = req.body;

    if (status === undefined) {
      throw new ApiError(400, 'Status is required');
    }

    traveler.status = status;
    traveler.updatedBy = req.user._id;
    traveler.updatedOn = Date.now();

    await traveler.save();

    res.json(traveler);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTravelers,
  createTraveler,
  getTravelerById,
  updateTraveler,
  deleteTraveler,
  archiveTraveler,
  updateTravelerStatus
};