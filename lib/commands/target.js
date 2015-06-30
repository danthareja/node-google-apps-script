
var manifestor = require('../utils/manifestor');

function add(target, fileId) {
  return manifestor.get()
    .then(function(config) {
      config.targets[target] = {
        id: fileId,
        packages: config.packages
      };
      return config;
    })
    .then(manifestor.set);
}

function remove(target) {
  return manifestor.get()
    .then(function(config) {
      delete config.targets[target];
      return config;
    })
    .then(manifestor.set);
}

module.exports = {
  add: add,
  remove: remove
};
