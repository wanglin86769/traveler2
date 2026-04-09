const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const { User } = require('../models/User');
const config = require('../config');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'No token provided');
    }

    const token = authHeader.substring(7);
    const authConfig = config.auth;
    
    const decoded = jwt.verify(token, authConfig.jwt.secret);
    
    const user = await User.findById(decoded.sub).select('-password');
    
    if (!user) {
      throw new ApiError(401, 'User not found');
    }

    if (!user.active) {
      throw new ApiError(401, 'User account is inactive');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new ApiError(401, 'Invalid token'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Token expired'));
    }
    next(error);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Unauthorized access'));
    }

    const hasRole = roles.some(role => req.user.roles && req.user.roles.includes(role));
    
    if (!hasRole) {
      return next(new ApiError(403, 'Insufficient permissions'));
    }
    
    next();
  };
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const authConfig = config.auth;
    
    const decoded = jwt.verify(token, authConfig.jwt.secret);
    
    const user = await User.findById(decoded.sub).select('-password');
    
    if (user && user.active) {
      req.user = user;
    }
    
    next();
  } catch (error) {
    // Ignore token errors, continue execution
    next();
  }
};

module.exports = { authenticate, authorize, optionalAuth };