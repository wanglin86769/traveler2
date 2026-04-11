const { Binder } = require('../models/Binder');
const { Traveler, TravelerData } = require('../models/Traveler');
const { History } = require('../models/History');
const { getUserAccessLevel } = require('../middleware/accessControl');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

const calculateInputProgress = (binder) => {
  const total = binder.totalInput || 0;
  const finished = binder.finishedInput || 0;
  if (total === 0) return 0;
  return Math.round((finished / total) * 100);
};

const calculateTravelerProgress = (binder) => {
  const total = binder.totalWork || 0;
  const finished = binder.finishedWork || 0;
  if (total === 0) return 0;
  return Math.round((finished / total) * 100);
};

const calculateValueProgress = (binder) => {
  const total = binder.totalValue || 0;
  const finished = binder.finishedValue || 0;
  if (total === 0) return 0;
  return Math.round((finished / total) * 100);
};

const getAllBinders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search, tag, sort = '-updatedOn' } = req.query;
    
    const query = { status: { $ne: 3 } };
    
    const isAdmin = req.user.roles && req.user.roles.includes('admin');
    const isManager = req.user.roles && req.user.roles.includes('manager');
    if (!isAdmin && !isManager) {
      query.$or = [
        { createdBy: req.user._id },
        { owner: req.user._id },
        { publicAccess: { $gte: 0 } },
        { 'sharedWith.user': req.user._id }
      ];
    }

    if (status !== undefined) {
      query.status = parseFloat(status);
    }

    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      });
    }

    if (tag) {
      query.tags = tag;
    }

    const binders = await Binder.find(query)
      .populate('createdBy', '_id name')
      .populate('owner', '_id name')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Binder.countDocuments(query);

    res.json({
      data: binders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

const getBinderById = async (req, res, next) => {
  try {
    const binder = await Binder.findById(req.params.id);

    if (!binder) {
      throw new ApiError(404, 'Binder not found');
    }

    res.json(binder);
  } catch (error) {
    next(error);
  }
};

const createBinder = async (req, res, next) => {
  try {
    const { validationResult } = require('express-validator');
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, errors.array()[0].msg);
    }

    const { title, description, tags, deadline } = req.body;

    const binder = new Binder({
      title,
      description,
      tags,
      deadline,
      createdBy: req.user._id,
      owner: req.user._id,
      status: 0,
      works: []
    });

    await binder.save();

    res.status(201).json(binder);
  } catch (error) {
    next(error);
  }
};

const updateBinder = async (req, res, next) => {
  try {
    const binder = await Binder.findById(req.params.id);

    if (!binder) {
      throw new ApiError(404, 'Binder not found');
    }

    const accessLevel = await getUserAccessLevel(binder, req.user);
    
    if (accessLevel < 1) {
      throw new ApiError(403, 'Write access denied');
    }

    const { title, description, tags, deadline } = req.body;
    
    if (title) binder.title = title;
    if (description !== undefined) binder.description = description;
    if (tags) binder.tags = tags;
    if (deadline !== undefined) binder.deadline = deadline;

    await binder.save();

    res.json(binder);
  } catch (error) {
    next(error);
  }
};

const addWorksToBinder = async (req, res, next) => {
  try {
    const { ids, type } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new ApiError(400, 'ids must be a non-empty array');
    }

    if (!type || (type !== 'traveler' && type !== 'binder')) {
      throw new ApiError(400, 'type must be "traveler" or "binder"');
    }

    const binder = await Binder.findById(req.params.id);

    if (!binder) {
      throw new ApiError(404, 'Binder not found');
    }

    const accessLevel = await getUserAccessLevel(binder, req.user);
    
    if (accessLevel < 1) {
      throw new ApiError(403, 'Write access denied');
    }

    if (binder.status === 2 || binder.status === 3) {
      throw new ApiError(400, 'Cannot add works to a completed or archived binder');
    }

    let model;
    if (type === 'traveler') {
      model = require('../models/Traveler').Traveler;
    } else if (type === 'binder') {
      model = Binder;
    }

    const existingWorkIds = binder.works.map(w => w._id.toString());
    const addedIds = [];
    const skippedIds = [];

    const items = await model.find({
      _id: { $in: ids }
    });

    if (!items || items.length === 0) {
      throw new ApiError(404, 'No items found with the provided ids');
    }

    items.forEach(item => {
      if (existingWorkIds.includes(item._id.toString())) {
        skippedIds.push(item._id);
        return;
      }

      if (type === 'binder') {
        if (item._id.toString() === binder._id.toString()) {
          logger.warn(`Cannot add binder ${item._id} to itself`);
          skippedIds.push(item._id);
          return;
        }

        const hasNestedBinders = item.works.some(w => w.refType === 'binder');
        if (hasNestedBinders) {
          logger.warn(`Cannot add binder ${item._id} that contains other binders`);
          skippedIds.push(item._id);
          return;
        }
      }

      const newWork = {
        _id: item._id,
        refType: type,
        addedOn: new Date(),
        addedBy: req.user._id,
        status: item.status || 0,
        value: item.value || 10,
        sequence: binder.works.length + 1,
        color: 'blue'
      };

      binder.works.push(newWork);
      addedIds.push(item._id);
    });

    if (addedIds.length === 0) {
      throw new ApiError(400, 'No items were added (all already exist or cannot be added)');
    }

    binder.updatedOn = new Date();
    binder.updatedBy = req.user._id;

    await binder.save();
    await binder.updateProgress();

    res.status(200).json({
      ...binder.toObject(),
      added: addedIds.length,
      skipped: skippedIds.length
    });
  } catch (error) {
    next(error);
  }
};

const getBinderWorks = async (req, res, next) => {
  try {
    const binder = await Binder.findById(req.params.id);

    if (!binder) {
      throw new ApiError(404, 'Binder not found');
    }

    const accessLevel = await getUserAccessLevel(binder, req.user);
    
    if (accessLevel < 0) {
      throw new ApiError(403, 'Access denied');
    }

    const { works } = binder;
    const travelerIds = [];
    const binderIds = [];

    works.forEach(function(w) {
      if (w.refType === 'traveler') {
        travelerIds.push(w._id);
      } else {
        binderIds.push(w._id);
      }
    });

    const merged = [];
    
    if (travelerIds.length > 0) {
      const travelers = await Traveler.find(
        { _id: { $in: travelerIds } },
        'title mapping devices tags locations manPower status createdBy owner sharedWith finishedInput totalInput'
      ).lean().exec();
      
      travelers.forEach(function(t) {
        const work = works.id(t._id);
        if (work) {
          const workObj = work.toJSON ? work.toJSON() : work.toObject();
          Object.assign(t, workObj);
          merged.push(t);
        }
      });
    }

    if (binderIds.length > 0) {
      const childBinders = await Binder.find(
        { _id: { $in: binderIds } },
        'title tags status createdBy owner finishedValue inProgressValue totalValue finishedInput totalInput'
      ).lean().exec();
      
      childBinders.forEach(function(b) {
        const work = works.id(b._id);
        if (work) {
          const workObj = work.toJSON ? work.toJSON() : work.toObject();
          Object.assign(b, workObj);
          merged.push(b);
        }
      });
    }

    res.json({
      works: merged,
      inputProgress: calculateInputProgress(binder),
      travelerProgress: calculateTravelerProgress(binder),
      valueProgress: calculateValueProgress(binder)
    });
  } catch (error) {
    next(error);
  }
};

const addWorkToBinder = async (req, res, next) => {
  try {
    const { refType, refId, priority, value, color } = req.body;
    
    const binder = await Binder.findById(req.params.id);

    if (!binder) {
      throw new ApiError(404, 'Binder not found');
    }

    const accessLevel = await getUserAccessLevel(binder, req.user);
    
    if (accessLevel < 1) {
      throw new ApiError(403, 'Write access denied');
    }

    let workData;
    if (refType === 'traveler') {
      workData = await Traveler.findById(refId);
    } else if (refType === 'binder') {
      workData = await Binder.findById(refId);
    }

    if (!workData) {
      throw new ApiError(404, `${refType} not found`);
    }

    const work = {
      _id: refId,
      refType,
      addedOn: Date.now(),
      addedBy: req.user._id,
      status: workData.status,
      priority: priority || 5,
      sequence: binder.works.length + 1,
      value: value || 10,
      color: color || 'blue',
      finished: 0,
      inProgress: 0,
      finishedInput: 0,
      totalInput: 0
    };

    if (refType === 'traveler') {
      work.totalInput = workData.totalInput || 0;
      work.finishedInput = workData.finishedInput || 0;
      
      if (workData.status === 2) {
        work.finished = 1;
        work.inProgress = 0;
      } else if (workData.status === 0) {
        work.finished = 0;
        work.inProgress = 0;
      } else {
        work.finished = 0;
        if (workData.totalInput === 0) {
          work.inProgress = 1;
        } else {
          work.inProgress = workData.finishedInput / workData.totalInput;
        }
      }
    } else if (refType === 'binder') {
      work.finishedValue = workData.finishedValue || 0;
      work.inProgressValue = workData.inProgressValue || 0;
      work.totalValue = workData.totalValue || 0;
      
      if (workData.status === 2) {
        work.finished = 1;
        work.inProgress = 0;
      } else if (workData.status === 0) {
        work.finished = 0;
        work.inProgress = 0;
      } else {
        if (workData.totalValue === 0) {
          work.finished = 0;
          work.inProgress = 1;
        } else {
          work.finished = workData.finishedValue / workData.totalValue;
          work.inProgress = workData.inProgressValue / workData.totalValue;
        }
      }
    }

    binder.works.push(work);

    await binder.updateProgress();

    res.json(binder);
  } catch (error) {
    next(error);
  }
};

const removeWorkFromBinder = async (req, res, next) => {
  try {
    const binder = await Binder.findById(req.params.id);

    if (!binder) {
      throw new ApiError(404, 'Binder not found');
    }

    const accessLevel = await getUserAccessLevel(binder, req.user);
    
    if (accessLevel < 1) {
      throw new ApiError(403, 'Write access denied');
    }

    const workId = req.params.workId;
    
    const workIndex = binder.works.findIndex(w => w._id.toString() === workId);
    
    if (workIndex === -1) {
      throw new ApiError(404, 'Work not found');
    }

    binder.works.splice(workIndex, 1);

    await binder.updateProgress();

    res.json(binder);
  } catch (error) {
    next(error);
  }
};

const updateBinderStatus = async (req, res, next) => {
  try {
    const { validationResult } = require('express-validator');
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, errors.array()[0].msg);
    }

    const binder = await Binder.findById(req.params.id);

    if (!binder) {
      throw new ApiError(404, 'Binder not found');
    }

    const accessLevel = await getUserAccessLevel(binder, req.user);
    
    if (accessLevel < 2) {
      throw new ApiError(403, 'Owner access required');
    }

    const { status } = req.body;

    if (status === 1 && ![0, 2].includes(binder.status)) {
      throw new ApiError(400, 'Invalid status transition to active');
    }
    if (status === 2 && binder.status !== 1) {
      throw new ApiError(400, 'Invalid status transition to completed');
    }

    binder.status = status;
    binder.updatedBy = req.user._id;
    binder.updatedOn = Date.now();

    await binder.save();

    await History.create({
      t: 'binder',
      i: binder._id,
      b: req.user._id,
      c: [{ p: 'status', v: status }]
    });

    res.json(binder);
  } catch (error) {
    next(error);
  }
};

const archiveBinder = async (req, res, next) => {
  try {
    const binder = await Binder.findById(req.params.id);

    if (!binder) {
      throw new ApiError(404, 'Binder not found');
    }

    const isAdmin = req.user.roles && req.user.roles.includes('admin');
    if (binder.owner !== req.user._id && !isAdmin) {
      throw new ApiError(403, 'Not authorized');
    }

    binder.archived = true;
    binder.status = 3;
    binder.archivedOn = Date.now();
    binder.archivedBy = req.user._id;
    await binder.save();

    await History.create({
      t: 'binder',
      i: binder._id,
      b: req.user._id,
      c: [{ p: 'status', v: 3 }]
    });

    res.json({ message: 'Binder archived successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllBinders,
  getBinderById,
  createBinder,
  updateBinder,
  addWorksToBinder,
  getBinderWorks,
  addWorkToBinder,
  removeWorkFromBinder,
  updateBinderStatus,
  archiveBinder
};