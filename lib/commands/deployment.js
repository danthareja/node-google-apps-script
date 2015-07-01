
var manifestor = require('../utils/manifestor');
var colors = require('colors');
var deployments = require('../utils/deployments');
var defaults = require('../defaults');
var _ = require('lodash');
var path = require('path');

function add(depId, fileId, options) {

  var subdir = options.subdir || defaults.DEFAULT_DEPLOYMENT_SUBDIR;

  return manifestor.get()
    .then(function(config) {

      return deployments.deploymentForId(depId)
        .then(function(t) {
          // target exists
          if (t !== undefined) {
            config.deployments = _.reject(config.deployments, function(dep) {
              return dep.id === t.id;
            });
          }
          return config;
        })
        .then(function(c) {
          c.deployments.push({
            id: depId,
            fileId: fileId,
            key: options.key,
            path: path.join(subdir, depId),
            packages: [],
          });
          return c;
        });
    })
    .then(manifestor.set)
    .then(function() {
      console.log('Deployment ' + depId.green + ' added.');
    });
}

function remove(depId) {
  return manifestor.get()
    .then(function(config) {
      config.deployments = _.reject(config.deployments, function(dep) {
        return dep.id === depId;
      });
      return config;
    })
    .then(manifestor.set)
    .then(function() {
      console.log('Deployment ' + depId.green + ' removed.');
    });
}

module.exports = {
  add: add,
  remove: remove
};
