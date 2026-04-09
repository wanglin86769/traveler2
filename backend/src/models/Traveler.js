/*jslint es5: true*/

const mongoose = require('mongoose');
const config = require('../config');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const share = require('./share');
const logger = require('../utils/logger');

require('./Binder');
const Binder = mongoose.model('Binder');

/**
 * A form can become active, inactive, and reactive. The form's activated date
 *   and the form's updated data can tell if the form has been updated since
 *   it is used by the traveler.
 * activatedOn: the dates when this form starts to be active
 * alias : a name for convenience to distinguish forms.
 * mapping : user-key -> name
 * labels: name -> label
 * types: name -> input types
 * inputs : list of input names in the form
 * Mapping and inputs are decided by the form snapshot when a traveler is
 * created from it. They are within form because they will be never changed once
 * created.
 */

const form = new Schema({
  html: String,
  json: Schema.Types.Mixed, // v2: JSON format for form structure
  mapping: Schema.Types.Mixed,
  labels: Schema.Types.Mixed,
  // list of input names in the current active form
  // do not need this because of labels
  // inputs: [String],
  activatedOn: [Date],
  reference: ObjectId,
  _v: Number,
  alias: String,
});

const user = new Schema({
  _id: String,
  username: String,
});

const logData = new Schema({
  name: String,
  value: Schema.Types.Mixed,
  file: {
    path: String,
    encoding: String,
    mimetype: String,
  },
});

// a log is an array of log data collected in a form.
// the data is submitted in one request, which is different from traveler data.
const log = new Schema({
  referenceForm: { type: ObjectId, ref: 'Form' },
  records: [logData],
  inputBy: String,
  inputOn: Date,
});

/**
 * status := 0 // new
 *         | 1 // active
 *         | 1.5 // complete request
 *         | 2 // completed
 *         | 3 // frozen
 *         | 4 // archived
 */

const statusMap = {
  '0': 'initialized',
  '1': 'active',
  '1.5': 'submitted for completion',
  '2': 'completed',
  '3': 'frozen',
  '4': 'archived',
};

const stateTransition = [
  {
    from: 0,
    to: [1, 4],
  },
  {
    from: 1,
    to: [1.5, 3, 4],
  },
  {
    from: 1.5,
    to: [1, 2],
  },
  {
    from: 2,
    to: [4, 1],
  },
  {
    from: 3,
    to: [1],
  },
];

/**
 * publicAccess := 0 // for read or
 *               | 1 // for write or
 *               | -1 // no access
 */

const traveler = new Schema({
  title: String,
  description: String,
  devices: [String],
  locations: [String],
  manPower: [user],
  status: {
    type: Number,
    default: 0,
  },
  createdBy: String,
  createdOn: Date,
  clonedBy: String,
  clonedFrom: ObjectId,
  updatedBy: String,
  updatedOn: Date,
  archivedOn: Date,
  owner: String,
  tags: [String],
  transferredOn: Date,
  deadline: Date,
  publicAccess: {
    type: Number,
    default: config.defaults.traveler_public_access,
  },
  sharedWith: [share.user],
  sharedGroup: [share.group],
  // global object id of the active form
  referenceForm: ObjectId,
  // global object if of the discrepancy form
  referenceDiscrepancyForm: ObjectId,
  referenceReleasedForm: ObjectId,
  referenceReleasedFormVer: String,
  form: form,
  discrepancyForm: form,
  mapping: Schema.Types.Mixed,
  labels: Schema.Types.Mixed,
  types: Schema.Types.Mixed,
  // array of logs
  discrepancyLogs: [{ type: ObjectId, ref: 'Log' }],
  data: [{ type: ObjectId, ref: 'TravelerData' }],
  notes: [{ type: ObjectId, ref: 'TravelerNote' }],
  // decided by the active form input list
  // update with active form
  totalInput: {
    type: Number,
    default: 0,
    min: 0,
  },
  // decided by the touched inputs
  // keep for compatibility with previous versions
  finishedInput: {
    type: Number,
    default: 0,
    min: 0,
  },
  // list of inputs that have been touched accoring to the active form
  // update with traveler data and active form
  touchedInputs: [String],
  archived: {
    type: Boolean,
    default: false,
  },
});

/**
 * update the progress of binders that include this traveler document
 * @param  {Traveler} travelerDoc the traveler document
 * @return {undefined}
 */
async function updateBinderProgress(travelerDoc) {
  try {
    const binders = await Binder.find({
      status: {
        $ne: 3,
      },
      works: {
        $elemMatch: {
          _id: travelerDoc._id,
        },
      },
    }).exec();
    
    binders.forEach(function(binder) {
      binder.updateWorkProgress(travelerDoc);
      binder.updateProgress();
    });
  } catch (err) {
    console.error(
      'cannot find binders for traveler ' +
        travelerDoc._id +
        ', error: ' +
        err.message
    );
  }
}

traveler.pre('save', function(next) {
  var modifiedPaths = this.modifiedPaths();
  // keep it so that we can refer at post save
  this.wasModifiedPaths = modifiedPaths;
  next();
});

traveler.post('save', function(obj) {
  var modifiedPaths = this.wasModifiedPaths;
  if (
    modifiedPaths.indexOf('totalInput') !== -1 ||
    modifiedPaths.indexOf('finishedInput') !== -1 ||
    modifiedPaths.indexOf('status') !== -1
  ) {
    updateBinderProgress(obj);
  }
});

/**
 * type := 'file'
 *       | 'text'
 *       | 'textarea'
 *       | 'number'
 */

const travelerData = new Schema({
  traveler: ObjectId,
  name: String,
  value: Schema.Types.Mixed,
  file: {
    path: String,
    encoding: String,
    mimetype: String,
  },
  inputType: String,
  inputBy: String,
  inputOn: Date,
});

travelerData.pre('save', function validateNumber(next) {
  if (this.inputType === 'number') {
    if (typeof this.value !== this.inputType) {
      return next(
        new Error('value "' + this.value + '" is not a number')
      );
    }
  }
  next();
});

const travelerNote = new Schema({
  traveler: ObjectId,
  name: String,
  value: String,
  inputBy: String,
  updatedBy: String,
  inputOn: Date,
  updatedOn: Date,
});

const Traveler = mongoose.model('Traveler', traveler);
const TravelerData = mongoose.model('TravelerData', travelerData);
const TravelerNote = mongoose.model('TravelerNote', travelerNote);
const Log = mongoose.model('Log', log);

module.exports = {
  Traveler: Traveler,
  TravelerData: TravelerData,
  TravelerNote: TravelerNote,
  Log: Log,
  statusMap: statusMap,
  stateTransition: stateTransition,
};