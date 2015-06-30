
var manifestor = require('../utils/manifestor');
var colors = require('colors');

function add(target, fileId) {
  return manifestor.get()
    .then(function(config) {
      config.targets[target] = {
        id: fileId,
        packages: config.packages
      };
      return config;
    })
    .then(manifestor.set)
    .then(function() {
      console.log('Target ' + target.green + ' added.');
    });
}

function remove(target) {
  return manifestor.get()
    .then(function(config) {
      delete config.targets[target];
      return config;
    })
    .then(manifestor.set)
    .then(function() {
      console.log('Target ' + target.green + ' removed.');
    });
}

module.exports = {
  add: add,
  remove: remove
};
