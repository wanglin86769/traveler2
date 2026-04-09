const { Group } = require('../models/User');
const ApiError = require('../utils/ApiError');

const getAllGroups = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    
    const query = { deleted: false };

    if (search) {
      query.$or = [
        { _id: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ];
    }

    const groups = await Group.find(query)
      .populate('members', '_id name email')
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Group.countDocuments(query);

    res.json({
      data: groups,
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

const getGroupById = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('members', '_id name email');

    if (!group || group.deleted) {
      throw new ApiError(404, 'Group not found');
    }

    res.json(group);
  } catch (error) {
    next(error);
  }
};

const createGroup = async (req, res, next) => {
  try {
    const { validationResult } = require('express-validator');
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, errors.array()[0].msg);
    }

    const { _id, name, members } = req.body;

    const group = new Group({
      _id,
      name,
      members: members || []
    });

    await group.save();

    res.status(201).json(group);
  } catch (error) {
    next(error);
  }
};

const updateGroup = async (req, res, next) => {
  try {
    const { name, members } = req.body;
    
    const group = await Group.findByIdAndUpdate(
      req.params.id,
      { name, members },
      { new: true, runValidators: true }
    ).populate('members', '_id name email');

    if (!group) {
      throw new ApiError(404, 'Group not found');
    }

    res.json(group);
  } catch (error) {
    next(error);
  }
};

const addGroupMember = async (req, res, next) => {
  try {
    const { userId } = req.body;
    
    const group = await Group.findById(req.params.id);

    if (!group) {
      throw new ApiError(404, 'Group not found');
    }

    if (!group.members.includes(userId)) {
      group.members.push(userId);
      await group.save();
    }

    res.json(group);
  } catch (error) {
    next(error);
  }
};

const removeGroupMember = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      throw new ApiError(404, 'Group not found');
    }

    group.members = group.members.filter(m => m.toString() !== req.params.userId);
    await group.save();

    res.json(group);
  } catch (error) {
    next(error);
  }
};

const deleteGroup = async (req, res, next) => {
  try {
    const group = await Group.findByIdAndUpdate(
      req.params.id,
      { deleted: true },
      { new: true }
    );

    if (!group) {
      throw new ApiError(404, 'Group not found');
    }

    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllGroups,
  getGroupById,
  createGroup,
  updateGroup,
  addGroupMember,
  removeGroupMember,
  deleteGroup
};