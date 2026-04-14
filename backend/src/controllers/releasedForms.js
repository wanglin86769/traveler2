const { ReleasedForm } = require('../models/ReleasedForm');
const ApiError = require('../utils/ApiError');

const getAllReleasedForms = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, tag, sort = '-releasedOn', formType } = req.query;

    const query = { status: 1 };

    if (formType) {
      query.formType = formType;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (tag) {
      query.tags = tag;
    }

    const forms = await ReleasedForm.find(query)
      .populate('releasedBy', '_id name')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await ReleasedForm.countDocuments(query);

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

const getArchivedReleasedForms = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, tag, sort = '-archivedOn', formType } = req.query;

    const query = { status: 2 };

    if (formType) {
      query.formType = formType;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (tag) {
      query.tags = tag;
    }

    const forms = await ReleasedForm.find(query)
      .populate('releasedBy', '_id name')
      .populate('archivedBy', '_id name')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await ReleasedForm.countDocuments(query);

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

const getReleasedFormById = async (req, res, next) => {
  try {
    const form = await ReleasedForm.findById(req.params.id)
      .populate('releasedBy', '_id name email');

    if (!form) {
      throw new ApiError(404, 'Released form not found');
    }

    res.json(form);
  } catch (error) {
    next(error);
  }
};

const archiveReleasedForm = async (req, res, next) => {
  try {
    const isAdmin = req.user.roles && req.user.roles.includes('admin');
    const isManager = req.user.roles && req.user.roles.includes('manager');
    if (!isAdmin && !isManager) {
      throw new ApiError(403, 'Not authorized');
    }

    const form = await ReleasedForm.findById(req.params.id);

    if (!form) {
      throw new ApiError(404, 'Released form not found');
    }

    form.status = 2;
    form.archivedOn = Date.now();
    form.archivedBy = req.user._id;
    await form.save();

    res.json({ message: 'Released form archived successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllReleasedForms,
  getArchivedReleasedForms,
  getReleasedFormById,
  archiveReleasedForm
};
