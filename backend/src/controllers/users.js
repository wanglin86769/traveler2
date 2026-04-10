const { User, Group } = require('../models/User');
const ApiError = require('../utils/ApiError');
const bcrypt = require('bcryptjs');
const saltRounds = 10;

const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;

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
    const { name, email, phone, mobile, office, roles } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, mobile, office, roles },
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

const createUser = async (req, res, next) => {
  try {
    const { _id, name, email, phone, mobile, office, roles } = req.body;

    // Check if user already exists
    const existingUser = await User.findById(_id);
    if (existingUser) {
      throw new ApiError(400, 'User already exists');
    }

    // Create user without setting password
    const user = new User({
      _id,
      name,
      email,
      password: undefined,
      phone,
      mobile,
      office,
      roles: roles || []
    });

    await user.save();

    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;

    if (!password) {
      throw new ApiError(400, 'Password is required');
    }

    // Password strength validation
    if (password.length < 6) {
      throw new ApiError(400, 'Password must be at least 6 characters long');
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  resetPassword
};