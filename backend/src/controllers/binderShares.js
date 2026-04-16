const mongoose = require('mongoose');
const { Binder } = require('../models/Binder');
const { User } = require('../models/User');
const ApiError = require('../utils/ApiError');

// Share related functions for binders
const getBinderSharing = async (req, res, next) => {
  try {
    const binder = await Binder.findById(req.params.id);

    if (!binder) {
      throw new ApiError(404, 'Binder not found');
    }

    const isAdmin = req.user.roles && req.user.roles.includes('admin');
    if (binder.owner !== req.user._id && binder.createdBy !== req.user._id && !isAdmin) {
      throw new ApiError(403, 'Not authorized to view share settings');
    }

    res.json({
      publicAccess: binder.publicAccess,
      sharedWith: binder.sharedWith || [],
      sharedGroup: binder.sharedGroup || []
    });
  } catch (error) {
    next(error);
  }
};

const updatePublicAccess = async (req, res, next) => {
  try {
    const { access } = req.body;

    if (!['-1', '0', '1'].includes(access)) {
      throw new ApiError(400, 'Invalid access value. Must be -1, 0, or 1');
    }

    const binder = await Binder.findById(req.params.id);

    if (!binder) {
      throw new ApiError(404, 'Binder not found');
    }

    const isAdmin = req.user.roles && req.user.roles.includes('admin');
    if (binder.owner !== req.user._id && binder.createdBy !== req.user._id && !isAdmin) {
      throw new ApiError(403, 'Not authorized to update public access');
    }

    binder.publicAccess = parseInt(access);
    await binder.save();

    res.json({ message: 'Public access updated successfully', publicAccess: binder.publicAccess });
  } catch (error) {
    next(error);
  }
};

const addUserToShare = async (req, res, next) => {
  try {
    const { userId, username, access } = req.body;

    if (!userId && !username) {
      throw new ApiError(400, 'User ID or username is required');
    }

    const accessLevel = access === 'write' ? 1 : 0;

    const binder = await Binder.findById(req.params.id);

    if (!binder) {
      throw new ApiError(404, 'Binder not found');
    }

    const isAdmin = req.user.roles && req.user.roles.includes('admin');
    if (binder.owner !== req.user._id && binder.createdBy !== req.user._id && !isAdmin) {
      throw new ApiError(403, 'Not authorized to add user to share');
    }

    // Find user in local database
    let user;
    if (userId) {
      user = await User.findById(userId);
    } else {
      user = await User.findOne({ name: username });
    }

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Check if user is already in sharedWith
    const existingShare = binder.sharedWith?.find(s => s._id === user._id);
    if (existingShare) {
      throw new ApiError(400, 'User is already in the share list');
    }

    // Add user to sharedWith
    binder.sharedWith = binder.sharedWith || [];
    binder.sharedWith.push({
      _id: user._id,
      username: user.name,
      access: accessLevel
    });

    await binder.save();

    // Add binder to user's binders array
    await User.findByIdAndUpdate(user._id, {
      $addToSet: { binders: binder._id }
    });

    res.json({ message: 'User added to share list successfully', sharedWith: binder.sharedWith });
  } catch (error) {
    next(error);
  }
};

const updateUserShareAccess = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { access } = req.body;

    if (!['read', 'write'].includes(access)) {
      throw new ApiError(400, 'Invalid access value. Must be read or write');
    }

    const binder = await Binder.findById(req.params.id);

    if (!binder) {
      throw new ApiError(404, 'Binder not found');
    }

    const isAdmin = req.user.roles && req.user.roles.includes('admin');
    if (binder.owner !== req.user._id && binder.createdBy !== req.user._id && !isAdmin) {
      throw new ApiError(403, 'Not authorized to update user share access');
    }

    const share = binder.sharedWith?.find(s => s._id === userId);
    if (!share) {
      throw new ApiError(404, 'User not found in share list');
    }

    share.access = access === 'write' ? 1 : 0;

    await binder.save();

    res.json({ message: 'User share access updated successfully', share });
  } catch (error) {
    next(error);
  }
};

const removeUserFromShare = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const binder = await Binder.findById(req.params.id);

    if (!binder) {
      throw new ApiError(404, 'Binder not found');
    }

    const isAdmin = req.user.roles && req.user.roles.includes('admin');
    if (binder.owner !== req.user._id && binder.createdBy !== req.user._id && !isAdmin) {
      throw new ApiError(403, 'Not authorized to remove user from share');
    }

    const shareIndex = binder.sharedWith?.findIndex(s => s._id === userId);
    if (shareIndex === -1) {
      throw new ApiError(404, 'User not found in share list');
    }

    binder.sharedWith.splice(shareIndex, 1);

    await binder.save();

    // Remove binder from user's binders array
    await User.findByIdAndUpdate(userId, {
      $pull: { binders: binder._id }
    });

    res.json({ message: 'User removed from share list successfully', sharedWith: binder.sharedWith });
  } catch (error) {
    next(error);
  }
};

const addGroupToShare = async (req, res, next) => {
  try {
    const { groupId, access } = req.body;

    if (!groupId) {
      throw new ApiError(400, 'Group ID is required');
    }

    const accessLevel = access === 'write' ? 1 : 0;

    const binder = await Binder.findById(req.params.id);

    if (!binder) {
      throw new ApiError(404, 'Binder not found');
    }

    const isAdmin = req.user.roles && req.user.roles.includes('admin');
    if (binder.owner !== req.user._id && binder.createdBy !== req.user._id && !isAdmin) {
      throw new ApiError(403, 'Not authorized to add group to share');
    }

    // Check if group exists in local database
    const Group = mongoose.model('Group');
    const group = await Group.findById(groupId);

    if (!group) {
      throw new ApiError(404, 'Group not found');
    }

    // Check if group is already in sharedGroup
    const existingShare = binder.sharedGroup?.find(s => s._id === groupId);
    if (existingShare) {
      throw new ApiError(400, 'Group is already in the share list');
    }

    // Add group to sharedGroup
    binder.sharedGroup = binder.sharedGroup || [];
    binder.sharedGroup.push({
      _id: group._id,
      groupname: group.name,
      access: accessLevel
    });

    await binder.save();

    // Add binder to group's binders array
    await Group.findByIdAndUpdate(group._id, {
      $addToSet: { binders: binder._id }
    });

    res.json({ message: 'Group added to share list successfully', sharedGroup: binder.sharedGroup });
  } catch (error) {
    next(error);
  }
};

const updateGroupShareAccess = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { access } = req.body;

    if (!['read', 'write'].includes(access)) {
      throw new ApiError(400, 'Invalid access value. Must be read or write');
    }

    const binder = await Binder.findById(req.params.id);

    if (!binder) {
      throw new ApiError(404, 'Binder not found');
    }

    const isAdmin = req.user.roles && req.user.roles.includes('admin');
    if (binder.owner !== req.user._id && binder.createdBy !== req.user._id && !isAdmin) {
      throw new ApiError(403, 'Not authorized to update group share access');
    }

    const share = binder.sharedGroup?.find(s => s._id === groupId);
    if (!share) {
      throw new ApiError(404, 'Group not found in share list');
    }

    share.access = access === 'write' ? 1 : 0;

    await binder.save();

    res.json({ message: 'Group share access updated successfully', share });
  } catch (error) {
    next(error);
  }
};

const removeGroupFromShare = async (req, res, next) => {
  try {
    const { groupId } = req.params;

    const binder = await Binder.findById(req.params.id);

    if (!binder) {
      throw new ApiError(404, 'Binder not found');
    }

    const isAdmin = req.user.roles && req.user.roles.includes('admin');
    if (binder.owner !== req.user._id && binder.createdBy !== req.user._id && !isAdmin) {
      throw new ApiError(403, 'Not authorized to remove group from share');
    }

    const shareIndex = binder.sharedGroup?.findIndex(s => s._id === groupId);
    if (shareIndex === -1) {
      throw new ApiError(404, 'Group not found in share list');
    }

    binder.sharedGroup.splice(shareIndex, 1);

    await binder.save();

    // Remove binder from group's binders array
    const Group = mongoose.model('Group');
    await Group.findByIdAndUpdate(groupId, {
      $pull: { binders: binder._id }
    });

    res.json({ message: 'Group removed from share list successfully', sharedGroup: binder.sharedGroup });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBinderSharing,
  updatePublicAccess,
  addUserToShare,
  updateUserShareAccess,
  removeUserFromShare,
  addGroupToShare,
  updateGroupShareAccess,
  removeGroupFromShare
};