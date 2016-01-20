'use strict'
const EventEmitter = require('events').EventEmitter

module.exports = function(connect) {
  if (!connect) {
    throw new Error('connect was not passed to UvaStore wrapper')
  }

  /**
   * Connect's Store.
   */
  const Store = connect.Store || connect.session.Store

  /**
   * Initialize UvaStore with the given `options`.
   *
   * @param {Object} options
   * @api public
   */

  class UvaStore extends Store {
    constructor(sessionClient, options) {
      options = options || {}
      options.name = options.name || 'session'
      super(options)

      this.client = new EventEmitter()

      if (!sessionClient) {
        throw new Error('sessionClient was not passed in')
      }

      // the default is 2 weeks in seconds
      this._ttl = options.ttl || 60 * 60 * 24 * 7 * 2
      this._touchAfter = options.touchAfter || 0

      this.client.emit('connect')

      sessionClient.register(['get', 'set', 'destroy'])
      this._session = sessionClient.methods
    }

    /**
     * Attempt to fetch session by the given `sid`.
     *
     * @param {String} sid
     * @param {Function} callback
     * @api public
     */
    get(sid, cb) {
      this._session.get(sid, cb)
    }

    /**
     * Commit the given `sess` object associated with the given `sid`.
     *
     * @param {String} sid
     * @param {Session} sess
     * @param {Function} callback
     * @api public
     */
    set(sid, session, cb) {
      // removing the lastModified prop from the session object before update
      if (this._touchAfter > 0 && session && session.lastModified) {
        delete session.lastModified
      }

      this._session.set(sid, session, {
        touchAfter: this._touchAfter,
        ttl: this._ttl,
      }, cb)
    }

    /**
     * Destroy the session associated with the given `sid`.
     *
     * @param {String} sid
     * @param {Function} callback
     * @api public
     */
    destroy(sid, cb) {
      this._session.destroy(sid, cb || function() {})
    }
  }

  return UvaStore
}
