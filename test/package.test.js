'use strict'
const expect = require('chai').expect
const connectUva = require('..')

describe('Package', function() {
  let connect = {
    Store: {},
  }

  it('should throw error if no connect was passed', function() {
    expect(() => connectUva(null)).to
      .throw(Error, 'connect was not passed to UvaStore wrapper')
  })
})
