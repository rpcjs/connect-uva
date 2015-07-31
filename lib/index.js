'use strict';

var EventEmitter = require('events').EventEmitter;
var util = require('util');

module.exports = function(connect) {
  if (!connect) {
    throw new Error('connect was not passed to UvaStore wrapper');
  }

  /**
   * Connect's Store.
   */
  var Store = connect.Store || connect.session.Store;

  /**
   * Initialize UvaStore with the given `options`.
   *
   * @param {Object} options
   * @api public
   */

  function UvaStore(sessionClient, options) {
    options = options || {};
    options.name = options.name || 'session';
    Store.call(this, options);

    this.client = new EventEmitter();
    var self = this;

    if (!sessionClient) {
      throw new Error('sessionClient was not passed in');
    }

    this._ttl = options.ttl || 60 * 60 * 24 * 7 * 2; // the default is 2 weeks in seconds
    this._touchAfter = options.touchAfter || 0;

    self.client.emit('connect');

    sessionClient.register(['get', 'set', 'destroy']);
    this._session = sessionClient.methods;
  }

  /**
   * Inherit from `Store`.
   */
  util.inherits(UvaStore, Store);

  /**
   * Attempt to fetch session by the given `sid`.
   *
   * @param {String} sid
   * @param {Function} callback
   * @api public
   */
  UvaStore.prototype.get = function(sid, cb) {
    this._session.get(sid, cb);
  };

  /**
   * Commit the given `sess` object associated with the given `sid`.
   *
   * @param {String} sid
   * @param {Session} sess
   * @param {Function} callback
   * @api public
   */
  UvaStore.prototype.set = function(sid, session, cb) {
    // removing the lastModified prop from the session object before update
    if (this._touchAfter > 0 && session && session.lastModified) {
      delete session.lastModified;
    }

    this._session.set(sid, session, {
      touchAfter: this._touchAfter,
      ttl: this._ttl
    }, cb);
  };

  /**
   * Destroy the session associated with the given `sid`.
   *
   * @param {String} sid
   * @param {Function} callback
   * @api public
   */
  UvaStore.prototype.destroy = function(sid, cb) {
    if (!cb) {
      cb = function() {};
    }
    this._session.destroy(sid, cb);
  };

  return UvaStore;
};
