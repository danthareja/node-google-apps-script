
var manifestor = require('../utils/manifestor');
var colors = require('colors');
var targets = require('../utils/targets');
var defaults = require('../defaults');
var _ = require('lodash');
var path = require('path');

function add(targetKey, fileId, options) {

  var subdir = options.subdir || defaults.DEFAULT_TARGET_SUBDIR;

  return manifestor.get()
    .then(function(config) {

      return targets.targetForId(targetKey)
        .then(function(t) {
          // target exists
          if (t !== undefined) {
            config.targets = _.reject(config.targets, function(targ) {
              return targ.id === t.id;
            });
          }
          return config;
        })
        .then(function(c) {
          c.targets.push({
            id: targetKey,
            fileId: fileId,
            path: path.join(subdir, targetKey),
            packages: c.packages
          });
          return c;
        });
    })
    .then(manifestor.set)
    .then(function() {
      console.log('Target ' + targetKey.green + ' added.');
    });
}

function remove(targetKey) {
  return manifestor.get()
    .then(function(config) {
      config.targets = _.reject(config.targets, function(targ) {
        return targ.id === targetKey;
      });
      return config;
    })
    .then(manifestor.set)
    .then(function() {
      console.log('Target ' + targetKey.green + ' removed.');
    });
}

module.exports = {
  add: add,
  remove: remove
};
