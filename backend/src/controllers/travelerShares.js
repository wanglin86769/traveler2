const { Traveler } = require('../models/Traveler');
const { User } = require('../models/User');
const { Group } = require('../models/User');
const ApiError = require('../utils/ApiError');

// Share related functions for travelers
const getTravelerSharing = async (req, res, next) => {
  try {
    const traveler = await Traveler.findById(req.params.id);

    if (!traveler) {
      throw new ApiError(404, 'Traveler not found');
    }

    const isAdmin = req.user.roles && req.user.roles.includes('admin');
    if (traveler.owner !== req.user._id && traveler.createdBy !== req.user._id && !isAdmin) {
      throw new ApiError(403, 'Not authorized to view share settings');
    }

    res.json({
      publicAccess: traveler.publicAccess,
      sharedWith: traveler.sharedWith || [],
      sharedGroup: traveler.sharedGroup || []
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

    const traveler = await Traveler.findById(req.params.id);

    if (!traveler) {
      throw new ApiError(404, 'Traveler not found');
    }

    const isAdmin = req.user.roles && req.user.roles.includes('admin');
    if (traveler.owner !== req.user._id && traveler.createdBy !== req.user._id && !isAdmin) {
      throw new ApiError(403, 'Not authorized to update public access');
    }

    traveler.publicAccess = parseInt(access);
    await traveler.save();

    res.json({
      message: 'Public access updated successfully',
      publicAccess: traveler.publicAccess
    });
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

    const traveler = await Traveler.findById(req.params.id);
    if (!traveler) {
      throw new ApiError(404, 'Traveler not found');
    }

    const isAdmin = req.user.roles && req.user.roles.includes('admin');
    if (traveler.owner !== req.user._id && traveler.createdBy !== req.user._id && !isAdmin) {
      throw new ApiError(403, 'Not authorized to share traveler');
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
    const existingShare = traveler.sharedWith?.find(s => s._id === user._id);
    if (existingShare) {
      throw new ApiError(400, 'User is already in the share list');
    }

    // Add user to sharedWith
    traveler.sharedWith = traveler.sharedWith || [];
    traveler.sharedWith.push({
      _id: user._id,
      username: user.name,
      access: accessLevel
    });

    await traveler.save();

    // Add traveler to user's travelers array
    await User.findByIdAndUpdate(user._id, {
      $addToSet: { travelers: traveler._id }
    });

    res.json({
      message: 'User added to share list successfully',
      sharedWith: traveler.sharedWith
    });
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

    const traveler = await Traveler.findById(req.params.id);

    if (!traveler) {
      throw new ApiError(404, 'Traveler not found');
    }

    const isAdmin = req.user.roles && req.user.roles.includes('admin');
    if (traveler.owner !== req.user._id && traveler.createdBy !== req.user._id && !isAdmin) {
      throw new ApiError(403, 'Not authorized to update user share access');
    }

    const share = traveler.sharedWith?.find(s => s._id === userId);

    if (!share) {
      throw new ApiError(404, 'User not found in share list');
    }

    share.access = access === 'write' ? 1 : 0;

    await traveler.save();

    res.json({
      message: 'User share access updated successfully',
      sharedWith: traveler.sharedWith
    });
  } catch (error) {
    next(error);
  }
};

const removeUserFromShare = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const traveler = await Traveler.findById(req.params.id);
    if (!traveler) {
      throw new ApiError(404, 'Traveler not found');
    }

    const isAdmin = req.user.roles && req.user.roles.includes('admin');
    if (traveler.owner !== req.user._id && traveler.createdBy !== req.user._id && !isAdmin) {
      throw new ApiError(403, 'Not authorized to remove user from share');
    }

    if (!traveler.sharedWith) {
      throw new ApiError(400, 'No users shared yet');
    }

    traveler.sharedWith = traveler.sharedWith.filter(
      share => share._id.toString() !== userId
    );

    await traveler.save();

    res.json({
      message: 'User removed from share successfully',
      sharedWith: traveler.sharedWith
    });
  } catch (error) {
    next(error);
  }
};

const addGroupToShare = async (req, res, next) => {
  try {
    const { groupId, write } = req.body;

    const traveler = await Traveler.findById(req.params.id);
    if (!traveler) {
      throw new ApiError(404, 'Traveler not found');
    }

    const group = await Group.findById(groupId);
    if (!group) {
      throw new ApiError(404, 'Group not found');
    }

    const isAdmin = req.user.roles && req.user.roles.includes('admin');
    if (traveler.owner !== req.user._id && traveler.createdBy !== req.user._id && !isAdmin) {
      throw new ApiError(403, 'Not authorized to share traveler with group');
    }

    if (!traveler.sharedGroup) {
      traveler.sharedGroup = [];
    }

    const existingShare = traveler.sharedGroup.find(
      share => share._id.toString() === groupId
    );

    if (existingShare) {
      existingShare.access = write ? 1 : 0;
    } else {
      traveler.sharedGroup.push({
        _id: groupId,
        groupname: group.name,
        access: write ? 1 : 0
      });
    }

    await traveler.save();

    // Add traveler to group's travelers array
    await Group.findByIdAndUpdate(groupId, {
      $addToSet: { travelers: traveler._id }
    });

    res.json({
      message: 'Group added to share successfully',
      sharedGroup: traveler.sharedGroup
    });
  } catch (error) {
    next(error);
  }
};

const updateGroupShareAccess = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { write } = req.body;

    const traveler = await Traveler.findById(req.params.id);

    if (!traveler) {
      throw new ApiError(404, 'Traveler not found');
    }

    const isAdmin = req.user.roles && req.user.roles.includes('admin');
    if (traveler.owner !== req.user._id && traveler.createdBy !== req.user._id && !isAdmin) {
      throw new ApiError(403, 'Not authorized to update group share access');
    }

    if (!traveler.sharedGroup) {
      throw new ApiError(400, 'No groups shared yet');
    }

    const groupShare = traveler.sharedGroup.find(
      share => share._id.toString() === groupId
    );

    if (!groupShare) {
      throw new ApiError(404, 'Group not found in share list');
    }

    groupShare.access = write ? 1 : 0;

    await traveler.save();

    res.json({
      message: 'Group access updated successfully',
      sharedGroup: traveler.sharedGroup
    });
  } catch (error) {
    next(error);
  }
};

const removeGroupFromShare = async (req, res, next) => {
  try {
    const { groupId } = req.params;

    const traveler = await Traveler.findById(req.params.id);
    if (!traveler) {
      throw new ApiError(404, 'Traveler not found');
    }

    const isAdmin = req.user.roles && req.user.roles.includes('admin');
    if (traveler.owner !== req.user._id && traveler.createdBy !== req.user._id && !isAdmin) {
      throw new ApiError(403, 'Not authorized to remove group from share');
    }

    if (!traveler.sharedGroup) {
      throw new ApiError(400, 'No groups shared yet');
    }

    traveler.sharedGroup = traveler.sharedGroup.filter(
      share => share._id.toString() !== groupId
    );

    await traveler.save();

    // Remove traveler from group's travelers array
    await Group.findByIdAndUpdate(groupId, {
      $pull: { travelers: traveler._id }
    });

    res.json({
      message: 'Group removed from share successfully',
      sharedGroup: traveler.sharedGroup
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTravelerSharing,
  updatePublicAccess,
  addUserToShare,
  updateUserShareAccess,
  removeUserFromShare,
  addGroupToShare,
  updateGroupShareAccess,
  removeGroupFromShare
};