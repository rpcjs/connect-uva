'use strict'
const EventEmitter = require('events').EventEmitter

module.exports = function(connect) {
  if (!connect) {
    throw new Error('connect was not passed to UvaStore wrapper')
  }

  const Store = connect.Store || connect.session.Store

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

    get(sid, cb) {
      this._session.get(sid, cb)
    }

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

    destroy(sid, cb) {
      this._session.destroy(sid, cb || function() {})
    }
  }

  return UvaStore
}
