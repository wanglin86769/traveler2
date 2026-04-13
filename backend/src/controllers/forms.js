const { Form, FormFile } = require('../models/Form');
const { ReleasedForm } = require('../models/ReleasedForm');
const { History } = require('../models/History');
const { User, Group } = require('../models/User');
const { getUserAccessLevel } = require('../middleware/accessControl');
const ApiError = require('../utils/ApiError');
const multer = require('multer');
const { getUploadDir, generateFilename, getFilePath } = require('../utils/storage');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = getUploadDir();
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const filename = generateFilename(file.originalname);
    cb(null, filename);
  }
});

const imageFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WebP)'), false);
  }
};

const imageUpload = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

const getDraftForms = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, sort = '-updatedOn' } = req.query;
    
    const query = {
      archived: false,
      status: 0,
      createdBy: req.user._id,
      owner: { $exists: false }  // Exclude transferred forms (v1 compatibility)
    };

    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      });
    }

    const forms = await Form.find(query)
      .populate('createdBy', '_id name')
      .populate('owner', '_id name')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Form.countDocuments(query);

    res.json({
      data: forms,
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

const getTransferredForms = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, sort = '-updatedOn' } = req.query;
    
    const query = {
      archived: false,
      status: 0,
      owner: req.user._id  // Forms transferred to current user
    };

    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      });
    }

    const forms = await Form.find(query)
      .populate('createdBy', '_id name')
      .populate('owner', '_id name')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Form.countDocuments(query);

    res.json({
      data: forms,
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

const getUnderReviewForms = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, sort = '-updatedOn' } = req.query;
    
    const query = {
      archived: false,
      status: 0.5,
      $or: [
        { createdBy: req.user._id },
        { owner: req.user._id },
        { 'sharedWith.user': req.user._id }
      ]
    };

    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      });
    }

    const forms = await Form.find(query)
      .populate('createdBy', '_id name')
      .populate('owner', '_id name')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Form.countDocuments(query);

    res.json({
      data: forms,
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

const getClosedForms = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, sort = '-updatedOn' } = req.query;
    
    const query = {
      archived: false,
      status: 1,
      $or: [
        { createdBy: req.user._id },
        { owner: req.user._id },
        { 'sharedWith.user': req.user._id }
      ]
    };

    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      });
    }

    const forms = await Form.find(query)
      .populate('createdBy', '_id name')
      .populate('owner', '_id name')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Form.countDocuments(query);

    res.json({
      data: forms,
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

const getArchivedForms = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, sort = '-updatedOn' } = req.query;

    const query = {
      $and: [
        {
          $or: [
            {
              createdBy: req.user._id,
              owner: { $exists: false }
            },
            {
              owner: req.user._id
            }
          ]
        },
        {
          $or: [
            { archived: true },
            { status: 2 }
          ]
        }
      ]
    };

    if (search) {
      query.$and.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      });
    }

    const forms = await Form.find(query)
      .populate('createdBy', '_id name')
      .populate('owner', '_id name')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Form.countDocuments(query);

    res.json({
      data: forms,
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

const getAllForms = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search, tag, sort = '-updatedOn' } = req.query;
    
    const query = { archived: false };
    
    const accessFilter = {
      $or: [
        { createdBy: req.user._id },
        { owner: req.user._id },
        { publicAccess: { $gte: 0 } },
        { 'sharedWith.user': req.user._id }
      ]
    };

    const isAdmin = req.user.roles && req.user.roles.includes('admin');
    const isManager = req.user.roles && req.user.roles.includes('manager');

    if (isAdmin || isManager) {
      delete accessFilter.$or;
    } else {
      Object.assign(query, accessFilter);
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

    const forms = await Form.find(query)
      .populate('createdBy', '_id name')
      .populate('owner', '_id name')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Form.countDocuments(query);

    res.json({
      data: forms,
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

const getFormById = async (req, res, next) => {
  try {
    const form = await Form.findById(req.params.id)
      .populate('createdBy', '_id name email')
      .populate('owner', '_id name email');

    if (!form) {
      throw new ApiError(404, 'Form not found');
    }

    const accessLevel = await getUserAccessLevel(form, req.user);
    
    if (accessLevel < 0) {
      throw new ApiError(403, 'Access denied');
    }

    const formObj = form.toObject();
    formObj.allApproved = form.allApproved ? form.allApproved() : false;

    res.json({
      ...formObj,
      accessLevel
    });
  } catch (error) {
    next(error);
  }
};

const createForm = async (req, res, next) => {
  try {
    const { validationResult } = require('express-validator');
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, errors.array()[0].msg);
    }

    const { title, description, json, tags, formType } = req.body;

    const { createFormWithHistory } = require('../models/Form');
    const newForm = await createFormWithHistory(req.user._id, {
      title,
      description: description || '',
      json: json || [],
      tags: tags || [],
      formType: formType || 'normal',
      createdBy: req.user._id,
      owner: req.user._id
    });

    res.status(201).json(newForm);
  } catch (error) {
    next(error);
  }
};

const updateForm = async (req, res, next) => {
  try {
    const form = await Form.findById(req.params.id);

    if (!form) {
      throw new ApiError(404, 'Form not found');
    }

    const accessLevel = await getUserAccessLevel(form, req.user);
    
    if (accessLevel < 1) {
      throw new ApiError(403, 'Write access denied');
    }

    const isAdmin = req.user.roles && req.user.roles.includes('admin');
    if (form.status !== 0 && !isAdmin) {
      throw new ApiError(400, 'Can only edit draft forms');
    }

    const { title, description, json, tags } = req.body;
    
    if (title !== undefined) form.title = title;
    if (description !== undefined) form.description = description;
    if (json !== undefined) form.json = json;
    if (tags !== undefined) form.tags = tags;

    form.updatedBy = req.user._id;
    form.updatedOn = Date.now();
    form.incrementVersion();

    const newDoc = await form.saveWithHistory(req.user._id);

    res.json(newDoc);
  } catch (error) {
    next(error);
  }
};

const releaseForm = async (req, res, next) => {
  try {
    const form = await Form.findById(req.params.id);

    if (!form) {
      throw new ApiError(404, 'Form not found');
    }

    if (form.createdBy.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'Not authorized to release this form');
    }

    if (form.status !== 0.5) {
      throw new ApiError(400, 'Form must be submitted for review (status 0.5) before release');
    }

    if (!form.allApproved || !form.allApproved()) {
      throw new ApiError(400, 'Form must be approved by all reviewers before release');
    }

    const { FormContent } = require('../models/ReleasedForm');
    const { discrepancyFormId } = req.body;
    const releasedForm = new ReleasedForm({
      title: form.title,
      description: form.description,
      releasedBy: req.user._id,
      releasedOn: Date.now(),
      tags: form.tags,
      formType: form.formType,
      base: new FormContent({
        title: form.title,
        description: form.description,
        json: form.json,
        formType: form.formType,
        _v: form._v
      }),
      ver: `${form._v || 0}`
    });

    if (discrepancyFormId) {
      const discrepancyForm = await ReleasedForm.findById(discrepancyFormId);
      if (!discrepancyForm) {
        throw new ApiError(404, 'Discrepancy form not found');
      }

      if (discrepancyForm.formType !== 'discrepancy') {
        throw new ApiError(400, 'Selected form is not a discrepancy form');
      }
      if (discrepancyForm.status !== 1) {
        throw new ApiError(400, 'Discrepancy form must be released');
      }

      releasedForm.formType = 'normal_discrepancy';
      releasedForm.discrepancy = discrepancyForm.base;
      releasedForm.ver += `:${discrepancyForm.base._v}`;
    }

    const existingForm = await ReleasedForm.findOne({
      title: releasedForm.title,
      formType: releasedForm.formType,
      ver: releasedForm.ver,
      status: 1,
    });

    if (existingForm) {
      throw new ApiError(400, `A form with same title, type, and version was already released: ${existingForm._id}`);
    }

    await releasedForm.save();

    form.status = 1;
    form.updatedBy = req.user._id;
    form.updatedOn = Date.now();
    await form.save();

    if (form.closeReviewRequests) {
      await form.closeReviewRequests();
    }

    await History.create({
      t: 'form',
      i: form._id,
      b: req.user._id,
      c: [{ p: 'status', v: 1 }]
    });

    res.json({
      message: 'Form released successfully',
      form,
      releasedForm
    });
  } catch (error) {
    next(error);
  }
};

const cloneForm = async (req, res, next) => {
  try {
    const originalForm = await Form.findById(req.params.id);

    if (!originalForm) {
      throw new ApiError(404, 'Form not found');
    }

    const accessLevel = await getUserAccessLevel(originalForm, req.user);

    if (accessLevel < 0) {
      throw new ApiError(403, 'Access denied');
    }

    const clonedForm = new Form({
      title: req.body.title,
      json: originalForm.json,
      formType: originalForm.formType,
      tags: originalForm.tags,
      createdBy: req.user._id,
      createdOn: Date.now(),
      updatedBy: req.user._id,
      updatedOn: Date.now(),
      sharedWith: [],
      clonedFrom: originalForm._id,
      status: 0
    });

    await clonedForm.saveWithHistory(req.user._id);

    res.status(201).json(clonedForm);
  } catch (error) {
    next(error);
  }
};

const archiveForm = async (req, res, next) => {
  try {
    const form = await Form.findById(req.params.id);

    if (!form) {
      throw new ApiError(404, 'Form not found');
    }

    const accessLevel = await getUserAccessLevel(form, req.user);
    if (accessLevel < 1) {
      throw new ApiError(403, 'Not authorized');
    }

    const isAdmin = req.user.roles && req.user.roles.includes('admin');
    if (form.owner !== req.user._id && !isAdmin) {
      throw new ApiError(403, 'Not authorized');
    }

    form.archived = true;
    form.status = 2;
    form.archivedOn = Date.now();
    form.archivedBy = req.user._id;
    await form.save();

    await History.create({
      t: 'form',
      i: form._id,
      b: req.user._id,
      c: [{ p: 'archived', v: true }]
    });

    res.json({ message: 'Form archived successfully' });
  } catch (error) {
    next(error);
  }
};

const uploadFormImage = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError(400, 'No file uploaded');
    }

    if (!req.body.name) {
      throw new ApiError(400, 'Expect input name');
    }

    const form = await Form.findById(req.params.id);
    if (!form) {
      throw new ApiError(404, 'Form not found');
    }

    const accessLevel = await getUserAccessLevel(form, req.user);
    if (accessLevel < 1) {
      throw new ApiError(403, 'Not authorized to upload files to this form');
    }

    const formFile = new FormFile({
      form: req.params.id,
      value: req.file.originalname,
      inputType: 'file',
      file: {
        path: getFilePath(req.file.filename),
        encoding: req.file.encoding,
        mimetype: req.file.mimetype,
        size: req.file.size
      },
      uploadedBy: req.user._id,
      uploadedOn: new Date()
    });

    await formFile.save();

    const fileUrl = `/api/formfiles/${formFile._id}/file`;

    res.status(201).json({
      _id: formFile._id,
      value: req.file.originalname,
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: fileUrl,
      uploadedBy: req.user._id,
      uploadedOn: formFile.uploadedOn
    });
  } catch (error) {
    next(error);
  }
};

const transferOwnership = async (req, res, next) => {
  try {
    const { formIds, userId } = req.body;
    const currentUserId = req.user._id;

    // Verify target user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      throw new ApiError(404, 'Target user not found');
    }

    // Batch update form ownership
    const result = await Form.updateMany(
      {
        _id: { $in: formIds },
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
      throw new ApiError(400, 'No forms were transferred. Make sure you are the owner of the selected forms.');
    }

    res.json({
      message: 'Ownership transferred successfully',
      count: result.modifiedCount
    });
  } catch (error) {
    next(error);
  }
};

// Get forms shared with the current user (for Shared Draft Forms tab)
const getSharedFormsList = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, sort = '-updatedOn' } = req.query;

    const user = await User.findById(req.user._id, 'forms');

    if (!user) {
      return res.status(400).json({ message: 'Cannot identify the current user' });
    }

    // Filter out invalid ObjectIds
    const validFormIds = (user.forms || []).filter(id => {
      try {
        return require('mongoose').Types.ObjectId.isValid(id);
      } catch (e) {
        return false;
      }
    });

    // Build query
    const query = {
      _id: { $in: validFormIds },
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

    const forms = await Form.find(query)
      .select('title formType status tags owner updatedBy updatedOn publicAccess sharedWith sharedGroup')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Form.countDocuments(query);

    res.json({
      data: forms,
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

// Get forms shared with the current user's groups (for Group Shared Draft Forms tab)
const getGroupSharedFormsList = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, sort = '-updatedOn' } = req.query;

    // Find all groups that the current user is a member of
    const groups = await Group.find({
      members: req.user._id,
      deleted: { $ne: true }
    }).select('forms');

    // Merge all group forms, remove duplicates
    const formIds = [];
    for (const group of groups) {
      for (const formId of group.forms) {
        if (!formIds.includes(formId)) {
          formIds.push(formId);
        }
      }
    }

    // Build query
    const query = {
      _id: { $in: formIds },
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

    const forms = await Form.find(query)
      .select('title formType status tags owner updatedBy updatedOn publicAccess sharedWith sharedGroup')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Form.countDocuments(query);

    res.json({
      data: forms,
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

// Get public forms (for Public Forms page)
const getPublicForms = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, sort = '-updatedOn', status } = req.query;

    // Build query - only forms with public access
    const query = {
      publicAccess: { $in: [0, 1] },  // 0 = public read, 1 = public write
      archived: { $ne: true }
    };

    // Filter by status if provided (0 = draft, 1 = released)
    if (status !== undefined) {
      query.status = parseInt(status);
    }

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

    const forms = await Form.find(query)
      .populate('createdBy', '_id name')
      .populate('owner', '_id name')
      .select('title formType status tags owner updatedBy updatedOn publicAccess sharedWith sharedGroup createdBy version')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Form.countDocuments(query);

    res.json({
      data: forms,
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

module.exports = {
  getDraftForms,
  getTransferredForms,
  getUnderReviewForms,
  getClosedForms,
  getArchivedForms,
  getAllForms,
  getFormById,
  createForm,
  updateForm,
  releaseForm,
  cloneForm,
  archiveForm,
  transferOwnership,
  uploadFormImage,
  imageUpload,
  getSharedFormsList,
  getGroupSharedFormsList,
  getPublicForms
};