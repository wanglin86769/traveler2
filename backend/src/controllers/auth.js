const jwt = require('jsonwebtoken');
const ldapClient = require('../utils/ldapClient');
const { User } = require('../models/User');
const ApiError = require('../utils/ApiError');
const config = require('../config');
const logger = require('../utils/logger');

const generateToken = (user) => {
  const authConfig = config.auth;
  return jwt.sign(
    { sub: user._id, roles: user.roles },
    authConfig.jwt.secret,
    { expiresIn: authConfig.jwt.expiresIn }
  );
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
    
    if (ldapConfig.enabled) {
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

        return res.json({
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            roles: user.roles
          },
          token
        });
      } catch (ldapError) {
        logger.warn('LDAP auth failed, falling back to local auth', { error: ldapError.message });
      }
    }

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

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles
      },
      token
    });
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
    local: true,
    ldap: authConfig.ldap.enabled
  };

  res.json(providers);
};

module.exports = {
  login,
  getMe,
  logout,
  refreshToken,
  getProviders
};