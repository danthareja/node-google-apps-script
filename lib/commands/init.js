
var manifestor = require('../utils/manifestor');
var defaults = require('../defaults');
var Promise = require('bluebird');
var colors = require('colors');
var mkdirp = require('mkdirp');
var deployment = require('./deployment');

module.exports = function init(fileId, options) {
  var subdir = options.subdir || defaults.DEFAULT_SUBDIR;

  var config = {
    path: subdir,
    deployments: []
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
    .then(function() {
      return deployment.add(defaults.DEFAULT_DEPLOYMENT, fileId, {
        key: options.key
      });
    })
    .catch(function(err) {
      console.log('Error running init command'.red);
      throw err;
    });
};

