const mongoose = require('mongoose');
const { Traveler } = require('../models/Traveler');
const { ReleasedForm } = require('../models/ReleasedForm');
const { Log } = require('../models/Traveler');
const { User, Group } = require('../models/User');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

// Public travelers
const getPublicTravelers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    let query = {
      publicAccess: { $in: [0, 1] },
      $and: [
        {
          $or: [
            { archived: { $ne: true } },
            { archived: { $exists: false } },
          ],
        },
        {
          status: { $ne: 4 },
        },
      ],
    };

    // Add search conditions
    if (search) {
      const searchCondition = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      };
      query = { $and: [query, searchCondition] };
    }

    const skip = (page - 1) * limit;

    const travelers = await Traveler.find(query)
      .select('title description status devices tags createdBy clonedBy createdOn deadline updatedBy updatedOn sharedWith sharedGroup finishedInput totalInput')
      .sort({ updatedOn: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    const total = await Traveler.countDocuments(query);

    res.json({
      data: travelers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// My travelers
const getMyTravelers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status ? parseInt(req.query.status) : null;
    const userId = req.user._id;

    let query = {
      $and: [
        {
          $or: [
            {
              createdBy: userId,
              owner: { $exists: false },
            },
            {
              owner: userId,
            },
          ],
        },
        {
          $or: [
            { archived: { $ne: true } },
            { archived: { $exists: false } },
          ],
          status: { $ne: 4 },
        },
      ],
    };

    // Add search conditions
    if (search) {
      const searchCondition = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      };
      query = { $and: [query, searchCondition] };
    }

    // Add status filter
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

// Transferred travelers
const getTransferredTravelers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status ? parseInt(req.query.status) : null;
    const userId = req.user._id;

    let query = {
      $or: [
        { owner: userId },
        { createdBy: userId, transferredTo: { $exists: true, $ne: userId } }
      ],
      archived: { $ne: true }
    };

    // Add search conditions
    if (search) {
      const searchCondition = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      };
      query = { $and: [query, searchCondition] };
    }

    // Add status filter
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

// Shared travelers
const getSharedTravelers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, sort = '-updatedOn' } = req.query;
    const status = req.query.status ? parseInt(req.query.status) : null;

    const user = await User.findById(req.user._id, 'travelers');

    if (!user) {
      return res.status(400).json({ message: 'Cannot identify the current user' });
    }

    // Filter out invalid ObjectIds
    const validTravelerIds = (user.travelers || []).filter(id => {
      try {
        return require('mongoose').Types.ObjectId.isValid(id);
      } catch (e) {
        return false;
      }
    });

    // Build query
    const query = {
      _id: { $in: validTravelerIds },
      archived: { $ne: true }
    };

    // Add search filter if provided
    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      });
    }

    // Add status filter
    if (status !== null && !isNaN(status)) {
      query.status = status;
    }

    const travelers = await Traveler.find(query)
      .select('title description status tags owner updatedBy updatedOn publicAccess sharedWith sharedGroup')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    const total = await Traveler.countDocuments(query);

    res.json({
      data: travelers,
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

// Group shared travelers
const getGroupSharedTravelers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, sort = '-updatedOn' } = req.query;
    const status = req.query.status ? parseInt(req.query.status) : null;

    // Find all groups that the current user is a member of
    const groups = await Group.find({
      members: req.user._id,
      deleted: { $ne: true }
    }).select('travelers');

    // Merge all group travelers, remove duplicates
    const travelerIds = [];
    for (const group of groups) {
      for (const travelerId of group.travelers) {
        if (!travelerIds.includes(travelerId)) {
          travelerIds.push(travelerId);
        }
      }
    }

    // Build query
    const query = {
      _id: { $in: travelerIds },
      archived: { $ne: true }
    };

    // Add search filter if provided
    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      });
    }

    // Add status filter
    if (status !== null && !isNaN(status)) {
      query.status = status;
    }

    const travelers = await Traveler.find(query)
      .select('title description status tags owner updatedBy updatedOn publicAccess sharedWith sharedGroup')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    const total = await Traveler.countDocuments(query);

    res.json({
      data: travelers,
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

// Archived travelers
const getArchivedTravelers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status ? parseInt(req.query.status) : null;
    const userId = req.user._id;

    let query = {
      $and: [
        {
          $or: [
            {
              createdBy: userId,
              owner: { $exists: false },
            },
            {
              owner: userId,
            },
          ],
        },
        {
          $or: [
            {
              archived: true,
            },
            {
              status: 4,
            },
          ],
        },
      ],
    };

    // Add search conditions
    if (search) {
      const searchCondition = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      };
      query = { $and: [query, searchCondition] };
    }

    // Add status filter
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

// Legacy function for backward compatibility
const getAllTravelers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status ? parseInt(req.query.status) : null;
    const type = req.query.type || 'my'; // 'my', 'transferred', 'shared', 'groupShared', 'archived'
    const userId = req.user._id;

    // Route to appropriate function based on type
    switch (type) {
      case 'transferred':
        return getTransferredTravelers(req, res, next);
      case 'shared':
        return getSharedTravelers(req, res, next);
      case 'groupShared':
        return getGroupSharedTravelers(req, res, next);
      case 'archived':
        return getArchivedTravelers(req, res, next);
      case 'my':
      default:
        return getMyTravelers(req, res, next);
    }
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

const cloneTraveler = async (req, res, next) => {
  try {
    const originalTraveler = await Traveler.findById(req.params.id);

    if (!originalTraveler) {
      throw new ApiError(404, 'Traveler not found');
    }

    // Permission check
    const isAdmin = req.user.roles && req.user.roles.includes('admin');
    const isOwner = originalTraveler.owner === req.user._id || originalTraveler.createdBy === req.user._id;
    const isShared = originalTraveler.sharedWith?.some(s => s._id === req.user._id);
    const isGroupShared = originalTraveler.sharedGroup?.some(g => {
      // Need to check if user is in the group
      return false; // Simplified handling, actual implementation requires querying group members
    });

    if (!isAdmin && !isOwner && !isShared) {
      throw new ApiError(403, 'Access denied');
    }

    // Only create discrepancyForm if the original traveler actually has discrepancy content
    const hasDiscrepancyContent = originalTraveler.discrepancyForm?.json && 
      Array.isArray(originalTraveler.discrepancyForm.json) && 
      originalTraveler.discrepancyForm.json.length > 0

    const clonedTraveler = new Traveler({
      title: req.body.title || `${originalTraveler.title} clone`,
      description: originalTraveler.description,
      devices: [],                          // Clear devices
      locations: originalTraveler.locations || [],
      tags: originalTraveler.tags || [],         // Copy tags
      status: 1,                            // Set to active
      createdBy: req.user._id,
      createdOn: Date.now(),
      clonedBy: req.user._id,               // Record cloner
      clonedFrom: originalTraveler._id,     // Record source
      sharedWith: originalTraveler.sharedWith || [],    // Copy shared settings
      sharedGroup: originalTraveler.sharedGroup || [],  // Copy group shared settings
      referenceForm: originalTraveler.referenceForm,
      referenceReleasedForm: originalTraveler.referenceReleasedForm,
      referenceReleasedFormVer: originalTraveler.referenceReleasedFormVer,
      form: {
        json: originalTraveler.form?.json || [],
        activatedOn: [],                    // Clear activation time
        reference: originalTraveler.form?.reference,
        _v: originalTraveler.form?._v,
        alias: originalTraveler.form?.alias
      },
      // Only include discrepancyForm if there's actual discrepancy content
      ...(hasDiscrepancyContent ? {
        discrepancyForm: {
          json: originalTraveler.discrepancyForm.json,
          activatedOn: [],
          _v: originalTraveler.discrepancyForm._v,
          // Don't copy _id to avoid conflicts, let MongoDB generate new one
        },
        referenceDiscrepancyForm: originalTraveler.referenceDiscrepancyForm
      } : {}),
      data: [],                             // Clear data (critical)
      notes: [],                            // Clear notes
      totalInput: originalTraveler.totalInput || 0,
      finishedInput: 0,                     // Reset progress
      touchedInputs: [],                    // Clear touched inputs
      archived: false,
      owner: req.user._id
    });

    await clonedTraveler.save();

    // Update shared users' travelers array
    if (clonedTraveler.sharedWith && clonedTraveler.sharedWith.length > 0) {
      const userIds = clonedTraveler.sharedWith.map(s => s._id);
      await User.updateMany(
        { _id: { $in: userIds } },
        { $addToSet: { travelers: clonedTraveler._id } }
      );
    }

    // Update shared groups' travelers array
    if (clonedTraveler.sharedGroup && clonedTraveler.sharedGroup.length > 0) {
      const groupIds = clonedTraveler.sharedGroup.map(g => g._id);
      await Group.updateMany(
        { _id: { $in: groupIds } },
        { $addToSet: { travelers: clonedTraveler._id } }
      );
    }

    res.status(201).json(clonedTraveler);
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

const transferOwnership = async (req, res, next) => {
  try {
    const { travelerIds, userId } = req.body;
    const currentUserId = req.user._id;

    // Verify target user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      throw new ApiError(404, 'Target user not found');
    }

    // Batch update traveler ownership
    const result = await Traveler.updateMany(
      {
        _id: { $in: travelerIds },
        $or: [
          { owner: currentUserId }, // User is the current owner
          { $and: [
            { owner: { $exists: false } }, // No owner set yet
            { createdBy: currentUserId }   // User is the creator
          ]}
        ]
      },
      {
        owner: userId,
        transferredOn: new Date()
      }
    );

    if (result.modifiedCount === 0) {
      throw new ApiError(400, 'No travelers were transferred. Make sure you are the owner of the selected travelers.');
    }

    res.json({
      message: 'Ownership transferred successfully',
      count: result.modifiedCount
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicTravelers,
  getMyTravelers,
  getTransferredTravelers,
  getSharedTravelers,
  getGroupSharedTravelers,
  getArchivedTravelers,
  getAllTravelers,
  createTraveler,
  cloneTraveler,
  getTravelerById,
  updateTraveler,
  deleteTraveler,
  archiveTraveler,
  updateTravelerStatus,
  transferOwnership
};