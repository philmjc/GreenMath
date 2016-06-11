var utils = require('../utils/utils');
var assert = require('chai').assert;

describe('utils', function() {
  describe('#findIndex()', function () {
    var g = function(obj) {return obj.a === 2;};
    it('should return indexes of -1 & 2', function () {
      assert.equal(-1, utils.findIndex([{a:0},{a:1},{a:5},{a:3}], g));
      assert.equal(2, utils.findIndex([{a:0},{a:1},{a:2},{a:3}], g));
    });
  });
});
