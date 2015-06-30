
var manifestor = require('../utils/manifestor');
var defaults = require('../defaults');
var Promise = require('bluebird');

module.exports = function init(fileId, subdir, target, overwrite) {
  subdir = subdir || defaults.DEFAULT_SUBDIR;
  target = target || defaults.DEFAULT_TARGET;

  var config = {
    path: subdir,
    packages: [],
    targets: {}
  };

  config.targets[target] = {
    path: target,
    id: fileId
  };

  var overwritePromise = overwrite ?
    Promise.resolve() :
    manifestor.throwIfConfig();

  return overwritePromise
    .then(function() {
      return manifestor.set(config);
    })
    .then(function() {
      console.log('All done!');
    })
    .catch(function(err) {
      console.log('Error running init command'.red);
      throw err;
    });
};

