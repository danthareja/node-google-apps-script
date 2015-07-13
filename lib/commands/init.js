
var manifestor = require('../utils/manifestor');
var defaults = require('../defaults');
var Promise = require('bluebird');
var colors = require('colors');
var mkdirp = require('mkdirp');

module.exports = function init(options) {
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
      console.log('All done!');
      console.log('Don\'t forget to create a deployment target with');
      console.log('gapps add <deployment> <fileId>'.green);
      console.log('(ex: `gapps add dev <fileId>`)'.green);
    })
    .catch(function(err) {
      console.log('Error running init command'.red);
      throw err;
    });
};

