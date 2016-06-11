
var utils = {};

utils.findIndex = function(array, cb) {
  for (var i = 0; i < array.length; i++) {
    if (cb(array[i])) return i;
  }
  return -1;
};

module.exports = utils;
