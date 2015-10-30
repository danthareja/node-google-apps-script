
var manifestor = require('../utils/manifestor');
var defaults = require('../defaults');
var Promise = require('bluebird');
var colors = require('colors');
var mkdirp = require('mkdirp');

module.exports = function init(fileId, options) {
  var subdir = options.subdir || defaults.DEFAULT_SUBDIR;

  var config = {
    path: subdir,
    fileId: fileId,
    key: options.key
  };

  var overwritePromise = options.overwrite ?
    Promise.resolve() :
    manifestor.throwIfConfig();

  return overwritePromise
    .then(function() {
      return manifestor.set(config);
    })
    .then(function() {
      return mkdirp(subdir);
    })
    .catch(function(err) {
      console.log('Error running init command'.red);
      throw err;
    });
};

