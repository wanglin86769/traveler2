const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const share = require('./share');

const UserSchema = new Schema({
  _id: {
    type: String,
    required: true
  },
  password: {
    type: String
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String
  },
  office: {
    type: String
  },
  phone: {
    type: String
  },
  mobile: {
    type: String
  },
  roles: [{
    type: String,
    enum: ['admin', 'manager', 'reviewer', 'read_all_forms', 'write_active_travelers']
  }],
  forms: [{
    type: Schema.Types.ObjectId,
    ref: 'Form'
  }],
  travelers: [{
    type: Schema.Types.ObjectId,
    ref: 'Traveler'
  }],
  binders: [{
    type: Schema.Types.ObjectId,
    ref: 'Binder'
  }],
  reviews: [{
    type: Schema.Types.ObjectId,
    ref: 'Form'
  }],
  lastLogin: {
    type: Date
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'users'
});

const GroupSchema = new Schema({
  _id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  members: [{
    type: String,
    ref: 'User'
  }],
  forms: [{
    type: Schema.Types.ObjectId,
    ref: 'Form'
  }],
  travelers: [{
    type: Schema.Types.ObjectId,
    ref: 'Traveler'
  }],
  binders: [{
    type: Schema.Types.ObjectId,
    ref: 'Binder'
  }],
  deleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  collection: 'groups'
});

UserSchema.methods.hasRole = function(role) {
  return this.roles && this.roles.includes(role);
};

UserSchema.methods.isAdmin = function() {
  return this.hasRole('admin');
};

UserSchema.methods.isManager = function() {
  return this.hasRole('manager');
};

module.exports = {
  User: mongoose.model('User', UserSchema),
  Group: mongoose.model('Group', GroupSchema),
  share: share.user,
  groupShare: share.group
};
