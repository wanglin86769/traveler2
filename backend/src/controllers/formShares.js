const mongoose = require('mongoose');
const { Form } = require('../models/Form');
const { User } = require('../models/User');
const ApiError = require('../utils/ApiError');

// Share related functions for forms
const getFormSharing = async (req, res, next) => {
  try {
    const form = await Form.findById(req.params.id);

    if (!form) {
      throw new ApiError(404, 'Form not found');
    }

    const isAdmin = req.user.roles && req.user.roles.includes('admin');
    if (form.owner !== req.user._id && form.createdBy !== req.user._id && !isAdmin) {
      throw new ApiError(403, 'Not authorized to view share settings');
    }

    res.json({
      publicAccess: form.publicAccess,
      sharedWith: form.sharedWith || [],
      sharedGroup: form.sharedGroup || []
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

    const form = await Form.findById(req.params.id);

    if (!form) {
      throw new ApiError(404, 'Form not found');
    }

    const isAdmin = req.user.roles && req.user.roles.includes('admin');
    if (form.owner !== req.user._id && form.createdBy !== req.user._id && !isAdmin) {
      throw new ApiError(403, 'Not authorized to update public access');
    }

    form.publicAccess = parseInt(access);
    await form.save();

    res.json({ message: 'Public access updated successfully', publicAccess: form.publicAccess });
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

    const form = await Form.findById(req.params.id);

    if (!form) {
      throw new ApiError(404, 'Form not found');
    }

    const isAdmin = req.user.roles && req.user.roles.includes('admin');
    if (form.owner !== req.user._id && form.createdBy !== req.user._id && !isAdmin) {
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
    const existingShare = form.sharedWith?.find(s => s._id === user._id);
    if (existingShare) {
      throw new ApiError(400, 'User is already in the share list');
    }

    // Add user to sharedWith
    form.sharedWith = form.sharedWith || [];
    form.sharedWith.push({
      _id: user._id,
      username: user.name,
      access: accessLevel
    });

    await form.save();

    // Add form to user's forms array
    await User.findByIdAndUpdate(user._id, {
      $addToSet: { forms: form._id }
    });

    res.json({ message: 'User added to share list successfully', sharedWith: form.sharedWith });
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

    const form = await Form.findById(req.params.id);

    if (!form) {
      throw new ApiError(404, 'Form not found');
    }

    const isAdmin = req.user.roles && req.user.roles.includes('admin');
    if (form.owner !== req.user._id && form.createdBy !== req.user._id && !isAdmin) {
      throw new ApiError(403, 'Not authorized to update user share access');
    }

    const share = form.sharedWith?.find(s => s._id === userId);
    if (!share) {
      throw new ApiError(404, 'User not found in share list');
    }

    share.access = access === 'write' ? 1 : 0;

    await form.save();

    res.json({ message: 'User share access updated successfully', share });
  } catch (error) {
    next(error);
  }
};

const removeUserFromShare = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const form = await Form.findById(req.params.id);

    if (!form) {
      throw new ApiError(404, 'Form not found');
    }

    const isAdmin = req.user.roles && req.user.roles.includes('admin');
    if (form.owner !== req.user._id && form.createdBy !== req.user._id && !isAdmin) {
      throw new ApiError(403, 'Not authorized to remove user from share');
    }

    const shareIndex = form.sharedWith?.findIndex(s => s._id === userId);
    if (shareIndex === -1) {
      throw new ApiError(404, 'User not found in share list');
    }

    form.sharedWith.splice(shareIndex, 1);

    await form.save();

    // Remove form from user's forms array
    await User.findByIdAndUpdate(userId, {
      $pull: { forms: form._id }
    });

    res.json({ message: 'User removed from share list successfully', sharedWith: form.sharedWith });
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

    const form = await Form.findById(req.params.id);

    if (!form) {
      throw new ApiError(404, 'Form not found');
    }

    const isAdmin = req.user.roles && req.user.roles.includes('admin');
    if (form.owner !== req.user._id && form.createdBy !== req.user._id && !isAdmin) {
      throw new ApiError(403, 'Not authorized to add group to share');
    }

    // Check if group exists in local database
    const Group = mongoose.model('Group');
    const group = await Group.findById(groupId);

    if (!group) {
      throw new ApiError(404, 'Group not found');
    }

    // Check if group is already in sharedGroup
    const existingShare = form.sharedGroup?.find(s => s._id === groupId);
    if (existingShare) {
      throw new ApiError(400, 'Group is already in the share list');
    }

    // Add group to sharedGroup
    form.sharedGroup = form.sharedGroup || [];
    form.sharedGroup.push({
      _id: group._id,
      groupname: group.name,
      access: accessLevel
    });

    await form.save();

    // Add form to group's forms array
    await Group.findByIdAndUpdate(group._id, {
      $addToSet: { forms: form._id }
    });

    res.json({ message: 'Group added to share list successfully', sharedGroup: form.sharedGroup });
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

    const form = await Form.findById(req.params.id);

    if (!form) {
      throw new ApiError(404, 'Form not found');
    }

    const isAdmin = req.user.roles && req.user.roles.includes('admin');
    if (form.owner !== req.user._id && form.createdBy !== req.user._id && !isAdmin) {
      throw new ApiError(403, 'Not authorized to update group share access');
    }

    const share = form.sharedGroup?.find(s => s._id === groupId);
    if (!share) {
      throw new ApiError(404, 'Group not found in share list');
    }

    share.access = access === 'write' ? 1 : 0;

    await form.save();

    res.json({ message: 'Group share access updated successfully', share });
  } catch (error) {
    next(error);
  }
};

const removeGroupFromShare = async (req, res, next) => {
  try {
    const { groupId } = req.params;

    const form = await Form.findById(req.params.id);

    if (!form) {
      throw new ApiError(404, 'Form not found');
    }

    const isAdmin = req.user.roles && req.user.roles.includes('admin');
    if (form.owner !== req.user._id && form.createdBy !== req.user._id && !isAdmin) {
      throw new ApiError(403, 'Not authorized to remove group from share');
    }

    const shareIndex = form.sharedGroup?.findIndex(s => s._id === groupId);
    if (shareIndex === -1) {
      throw new ApiError(404, 'Group not found in share list');
    }

    form.sharedGroup.splice(shareIndex, 1);

    await form.save();

    // Remove form from group's forms array
    const Group = mongoose.model('Group');
    await Group.findByIdAndUpdate(groupId, {
      $pull: { forms: form._id }
    });

    res.json({ message: 'Group removed from share list successfully', sharedGroup: form.sharedGroup });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFormSharing,
  updatePublicAccess,
  addUserToShare,
  updateUserShareAccess,
  removeUserFromShare,
  addGroupToShare,
  updateGroupShareAccess,
  removeGroupFromShare
};