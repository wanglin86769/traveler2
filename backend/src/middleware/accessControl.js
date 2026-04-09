const { User } = require('../models/User');
const ApiError = require('../utils/ApiError');

const checkAccess = (resource, accessLevel = 0) => {
  return async (req, res, next) => {
    try {
      const userId = req.user._id;
      const doc = resource;
      
      // Check if user is creator
      if (doc.createdBy === userId) {
        req.accessLevel = 1;
        return next();
      }
      
      // Check if user is owner
      if (doc.owner === userId) {
        req.accessLevel = 1;
        return next();
      }
      
      // Check if user is admin or manager
      if (req.user.isAdmin() || req.user.isManager()) {
        req.accessLevel = 1;
        return next();
      }
      
      // Check public access
      if (doc.publicAccess >= accessLevel) {
        req.accessLevel = doc.publicAccess;
        return next();
      }
      
      // Check shared with user
      const userShare = doc.sharedWith?.find(s => s.user === userId);
      if (userShare && userShare.access >= accessLevel) {
        req.accessLevel = userShare.access;
        return next();
      }
      
      // Check shared with group
      if (doc.sharedGroup && doc.sharedGroup.length > 0) {
        const groups = await User.findById(userId).populate('groups');
        for (const group of groups || []) {
          const groupShare = doc.sharedGroup.find(s => s.group === group._id);
          if (groupShare && groupShare.access >= accessLevel) {
            req.accessLevel = groupShare.access;
            return next();
          }
        }
      }
      
      // No access
      return next(new ApiError(403, 'Access denied'));
    } catch (error) {
      next(error);
    }
  };
};

const checkPublicAccess = (doc, userId) => {
  return doc.publicAccess >= 0;
};

const getUserAccessLevel = async (doc, user) => {
  if (!user) return doc.publicAccess || -1;
  
  const userId = user._id;
  
  if (doc.createdBy === userId || doc.owner === userId) return 1;
  if (user.isAdmin() || user.isManager()) return 1;
  
  const userShare = doc.sharedWith?.find(s => s.user === userId);
  if (userShare) return userShare.access;
  
  return doc.publicAccess || -1;
};

module.exports = { checkAccess, checkPublicAccess, getUserAccessLevel };
