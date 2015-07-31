'use strict';

var expect = require('chai').expect;
var connectUva = require('..');

describe('Package', function () {
  var connect = {
    Store: {}
  };

  it('should throw error if no connect was passed', function () {
    expect(function () {
      connectUva(null);
    }).to.throw(Error, 'connect was not passed to BograchStore wrapper');
  });
});
