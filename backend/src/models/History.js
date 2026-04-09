const mongoose = require('mongoose');

const { Schema } = mongoose;
const { Mixed } = Schema.Types;
const { ObjectId } = Schema.Types;
const assert = require('assert');

const logger = require('../utils/logger');

const VERSION_KEY = '_v';

/** ********
 * p: the property/path of an object
 * v: the change-to value of the property
 ********* */
const change = new Schema({
  p: {
    type: String,
    required: true,
  },
  v: {
    type: Mixed,
  },
});

/** ********
 * a: at, the date of the history
 * b: by, the author of the history
 * t: type, the object's type
 * i: id, the object's id
 * c: the array of changes
 ********* */
const history = new Schema({
  a: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  b: {
    type: String,
    required: true,
  },
  t: {
    type: String,
    required: true,
  },
  i: {
    type: ObjectId,
    refPath: 't',
    required: true,
  },
  c: [change],
});

const History = mongoose.model('History', history);

function addVersion(schema, options) {
  options = options || {};
  if (options.versionAll === true) {
    options.fieldsToVersion = Object.keys(schema.paths);
  }
  options.fieldsToVersion = []
    .concat(options.fieldsToVersion || [])
    .filter(function(field) {
      return schema.path(field);
    })
    .filter(function(field) {
      // exclude history updates, id, mongoose version, history version key
      return !['__updates', '_id', '__v', VERSION_KEY].includes(field);
    });

  schema.add({
    _v: { type: Number, default: 0 },
  });

  schema.methods.incrementVersion = function() {
    const doc = this;
    const version = doc.get(VERSION_KEY) || 0;
    logger.debug('Version increment check', { 
      docId: doc._id,
      currentVersion: version,
      fieldsToVersion: options.fieldsToVersion 
    });
    for (let i = 0; i < options.fieldsToVersion.length; i += 1) {
      const field = options.fieldsToVersion[i];
      logger.debug('Field modification check', { 
        docId: doc._id,
        field,
        isModified: doc.isModified(field)
      });
      if (
        (doc.isNew && doc.get(field) !== undefined) ||
        doc.isModified(field)
      ) {
        doc.set(VERSION_KEY, version + 1);
        return;
      }
    }
  };
}

/**
 * add History plugin
 * @param {Schema} schema
 * @param {Object} options
 */
function addHistory(schema, options) {
  options = options || {};
  if (options.watchAll === true) {
    options.fieldsToWatch = Object.keys(schema.paths);
  }
  options.fieldsToWatch = []
    .concat(options.fieldsToWatch || [])
    .filter(function(field) {
      return schema.path(field) || [VERSION_KEY].includes(field);
    })
    .filter(function(field) {
      return !['__updates', '_id'].includes(field);
    });

  schema.add({
    __updates: [
      {
        type: ObjectId,
        ref: History.modelName,
      },
    ],
  });

  /**
   * model instance method to save with history. A document should use #set()
   * to update in order to get the modified check working properly for
   * embedded document. Otherwise, explicitly #markModified(path) to mark
   * modified of the path.
   * @param  {String || any} userid the user making this update
   * @returns {Promise} a promise resolve the the doc or new doc or reject with error
   */
  schema.methods.saveWithHistory = async function(userid) {
    const doc = this;
    let uid;
    if (userid !== null && userid !== undefined) {
      if (typeof userid === 'string') {
        uid = userid;
      } else if (typeof userid.userid === 'string') {
        uid = userid.userid;
      }
    }

    assert.ok(uid, 'must specify user id');

    const c = [];
    if (!doc.isModified()) {
      return doc;
    }

    logger.debug('History save - watched fields', { 
      docId: doc._id,
      fieldsToWatch: options.fieldsToWatch 
    });
    options.fieldsToWatch.forEach(function(field) {
      logger.debug('History save - field modification check', { 
        docId: doc._id,
        field,
        isModified: doc.isModified(field)
      });
      if (
        (doc.isNew && doc.get(field) !== undefined) ||
        doc.isModified(field)
      ) {
        c.push({
          p: field,
          v: doc.get(field),
        });
      }
    });
    if (c.length === 0) {
      return doc;
    }
    const h = new History({
      a: Date.now(),
      b: uid,
      c,
      t: doc.constructor.modelName,
      i: doc._id,
    });
    logger.debug('History document created', { 
      historyId: h._id,
      docId: doc._id,
      userId: uid,
      changesCount: c.length
    });

    let historyDoc;
    try {
      historyDoc = await h.save();
    } catch (error) {
      logger.error(error.message);
      throw error;
    }

    if (historyDoc) {
      doc.__updates.push(historyDoc._id);
    }

    try {
      const newDoc = await doc.save();
      return newDoc;
    } catch (error) {
      logger.error(error.message);
      throw error;
    }
  };
}

module.exports = {
  History,
  addHistory,
  addVersion,
};