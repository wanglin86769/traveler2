const { User, Group } = require('../models/User');
const ApiError = require('../utils/ApiError');

const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, role, active } = req.query;
    
    if (!search && !role && active === undefined) {
      if (!req.user.isAdmin() && !req.user.isManager()) {
        throw new ApiError(403, 'You need admin or manager permission to list all users');
      }
    }
    
    const query = {};
    
    if (search) {
      query.$or = [
        { _id: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      query.roles = role;
    }
    
    if (active !== undefined) {
      query.active = active === 'true';
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      data: users,
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

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('forms travelers binders reviews');

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (req.user._id !== req.params.id &&
        !req.user.isAdmin() && !req.user.isManager()) {
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email
      });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { name, email, phone, mobile, office } = req.body;
    
    if (req.user._id !== req.params.id && !req.user.isAdmin()) {
      throw new ApiError(403, 'Not authorized to update this user');
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, mobile, office },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

const updateUserRoles = async (req, res, next) => {
  try {
    const { validationResult } = require('express-validator');
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, errors.array()[0].msg);
    }

    const { roles } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { roles },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

const deactivateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true }
    );

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  updateUserRoles,
  deactivateUser
};