const mongoose = require('mongoose');
const config = require('../config');

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;
const share = require('./share');

const { addHistory } = require('./History');
const { addVersion } = require('./History');
const { addReview } = require('./Review');

/** ****
publicAccess := 0 // for read or
        | 1 // for write or
        | -1 // no access
***** */
/** ****
status := 0 // editable draft
        | 0.5 // submitted for reviewing
        | 1 // review finished and all approved and released
        | 2 // archived
***** */

const stateTransition = [
  {
    from: 0,
    to: [0.5, 2],
  },
  {
    from: 0.5,
    to: [0, 1, 2],
  },
  {
    from: 1,
    to: [2],
  },
];

const statusMap = {
  '0': 'draft',
  '0.5': 'submitted for review',
  '1': 'approved and released',
  '2': 'archived',
};

const form = new Schema({
  title: String,
  description: String,
  createdBy: String,
  createdOn: Date,
  clonedFrom: ObjectId,
  updatedBy: String,
  updatedOn: Date,
  owner: String,
  tags: [String],
  status: {
    type: Number,
    default: 0,
  },
  transferredOn: Date,
  archivedOn: Date,
  archived: {
    type: Boolean,
    default: false,
  },
  publicAccess: {
    type: Number,
    default: config.defaults.form_public_access,
  },
  sharedWith: [share.user],
  sharedGroup: [share.group],
  json: Schema.Types.Mixed, // v2 JSON format
  formType: {
    type: String,
    default: 'normal',
    enum: ['normal', 'discrepancy'],
  },
});

/**
 * Check if a form should be rendered in builder
 * @returns true if rendered in builder view, other wise false
 */
form.methods.isBuilder = function() {
  const doc = this;
  return [0, 0.5, 1].includes(doc.status);
};

form.plugin(addVersion, {
  fieldsToVersion: ['title', 'description', 'json'],
});

form.plugin(addHistory, {
  fieldsToWatch: [
    'title',
    'description',
    'owner',
    'status',
    'createdBy',
    'publicAccess',
    'json',
    '_v',
  ],
});

form.plugin(addReview);

const formFile = new Schema({
  form: ObjectId,
  value: String,
  inputType: String,
  file: {
    path: String,
    encoding: String,
    mimetype: String,
  },
  uploadedBy: String,
  uploadedOn: Date,
});

const Form = mongoose.model('Form', form);
const FormFile = mongoose.model('FormFile', formFile);

const createForm = function(json, newFormResultCallBack) {
  const formToCreate = {};
  formToCreate.title = json.title;
  formToCreate.createdBy = json.createdBy;
  formToCreate.createdOn = Date.now();
  formToCreate.updatedBy = json.createdBy;
  formToCreate.updatedOn = Date.now();
  formToCreate.json = json.json || [];
  formToCreate.formType = json.formType || 'normal';
  formToCreate.sharedWith = [];
  new Form(formToCreate).save(newFormResultCallBack);
};

const createFormWithHistory = function(uid, json) {
  const formToCreate = {};
  formToCreate.title = json.title;
  formToCreate.createdBy = json.createdBy;
  formToCreate.createdOn = Date.now();
  formToCreate.updatedBy = json.createdBy;
  formToCreate.updatedOn = Date.now();
  formToCreate.json = json.json || [];
  formToCreate.formType = json.formType || 'normal';
  formToCreate.sharedWith = [];
  return new Form(formToCreate).saveWithHistory(uid);
};

module.exports = {
  Form,
  FormFile,
  stateTransition,
  statusMap,
  createForm,
  createFormWithHistory,
};