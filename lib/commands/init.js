
var manifestor = require('../utils/manifestor');
var defaults = require('../defaults');
var Promise = require('bluebird');
var colors = require('colors');

module.exports = function init(subdir, overwrite) {
  subdir = subdir || defaults.DEFAULT_SUBDIR;

  var config = {
    path: subdir,
    packages: [],
    targets: {}
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
      console.log('Don\'t forget to create a deployment target with');
      console.log('gaps target add <target> <fileId>'.green);
      console.log('(ex: `gaps target add dev <fileId>`)'.green);
    })
    .catch(function(err) {
      console.log('Error running init command'.red);
      throw err;
    });
};

