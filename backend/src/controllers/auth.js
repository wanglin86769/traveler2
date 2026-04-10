const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const ldapClient = require('../utils/ldapClient');
const { User } = require('../models/User');
const ApiError = require('../utils/ApiError');
const config = require('../config');
const logger = require('../utils/logger');

// Configuration validation function
const validateAuthConfig = (authConfig) => {
  const ldapEnabled = authConfig.ldap?.enabled ?? false;
  const localEnabled = authConfig.local?.enabled ?? false;

  // Case 1: No authentication method enabled
  if (!ldapEnabled && !localEnabled) {
    throw new Error(
      'Authentication configuration error: ' +
      'At least one authentication method must be enabled. ' +
      'Please enable either "local" or "ldap" authentication.'
    );
  }

  // Case 2: Both authentication methods enabled
  if (ldapEnabled && localEnabled) {
    throw new Error(
      'Authentication configuration error: ' +
      'Only one authentication method can be enabled. ' +
      'Please enable either "local" or "ldap", not both.'
    );
  }

  return { ldapEnabled, localEnabled };
};

const generateToken = (user) => {
  const authConfig = config.auth;
  return jwt.sign(
    { sub: user._id },
    authConfig.jwt.secret,
    { expiresIn: authConfig.jwt.expiresIn }
  );
};

// LDAP authentication function
const loginWithLdap = async (username, password) => {
  try {
    const ldapUser = await ldapClient.authenticate(username, password);
    
    let user = await User.findById(username);
    
    if (!user) {
      user = new User({
        _id: username,
        name: ldapUser.displayName || username,
        email: ldapUser.mail,
        roles: [],
        lastLogin: new Date()
      });
      await user.save();
    } else {
      user.lastLogin = new Date();
      await user.save();
    }

    const token = generateToken(user);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles
      },
      token
    };
  } catch (error) {
    // Do not fallback, throw error directly
    logger.error('LDAP authentication failed', { 
      username, 
      error: error.message 
    });
    throw new ApiError(401, 'LDAP authentication failed: ' + error.message);
  }
};

// Local authentication function
const loginWithLocal = async (username, password) => {
  const user = await User.findById(username);
  
  if (!user) {
    throw new ApiError(401, 'Invalid username or password');
  }

  const validPassword = await bcrypt.compare(password, user.password || '');
  
  if (!validPassword) {
    throw new ApiError(401, 'Invalid username or password');
  }

  user.lastLogin = new Date();
  await user.save();
  
  const token = generateToken(user);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      roles: user.roles
    },
    token
  };
};

const login = async (req, res, next) => {
  try {
    const { validationResult } = require('express-validator');
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, errors.array()[0].msg);
    }

    const { username, password } = req.body;

    const authConfig = config.auth;
    const ldapConfig = authConfig.ldap;
    
    // Validate authentication configuration
    const { ldapEnabled, localEnabled } = validateAuthConfig(authConfig);
    
    // Choose authentication method based on configuration
    let result;
    if (ldapEnabled) {
      result = await loginWithLdap(username, password);
    } else if (localEnabled) {
      result = await loginWithLocal(username, password);
    } else {
      // Should not reach here (config validation ensures this)
      throw new ApiError(500, 'Authentication method not configured');
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('forms travelers binders reviews');
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

const logout = (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

const refreshToken = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user || !user.active) {
      throw new ApiError(401, 'User not found or inactive');
    }

    const token = generateToken(user);

    res.json({ token });
  } catch (error) {
    next(error);
  }
};

const getProviders = (req, res) => {
  const authConfig = config.auth;
  const providers = {
    local: authConfig.local?.enabled ?? false,
    ldap: authConfig.ldap?.enabled ?? false
  };

  res.json(providers);
};

// Export validation function for server startup check
module.exports = {
  login,
  getMe,
  logout,
  refreshToken,
  getProviders,
  validateAuthConfig
};