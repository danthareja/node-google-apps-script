
var Promise = require('bluebird');
var mkdirp = Promise.promisify(require('mkdirp'));
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
          // if target exists, remove it
          if (t !== undefined) {
            config.deployments = _.reject(config.deployments, function(dep) {
              return dep.id === t.id;
            });
          }
          return config;
        })
        .then(function(c) {
          // then add the new target
          var targetLocation = path.join(defaults.DEFAULT_DEPLOYMENT_SUBDIR, depId)
          return mkdirp(targetLocation)
            .then(function() {
              c.deployments.push({
                id: depId,
                fileId: fileId,
                key: options.key,
                path: path.join(subdir, depId),
                packages: [],
              });
              return c;
            })
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

function getOAuthCallbackUrl(depId) {
  var deployments = [];
  return manifestor.get()
    .then(function(config) {
      if (!depId || depId.length === 0) {
        return config.deployments;
      } else {
        var dep = _.findWhere(config.deployments, {
          id: depId
        });

        if (dep === undefined) {
          throw 'No deployment with that ID';
        }

        return [dep];
      }
    })
    .then(function(deployments) {
      _.each(deployments, function(dep) {
        if (!_.has(dep, 'key')) {
          console.log(dep.id + ' does not have a Project Key set');
          return;
        }
        var url = 'https://script.google.com/macros/d/' + dep.key + '/usercallback';
        console.log(dep.id + ':', url.green);
      });
    });
}

module.exports.add = add;
module.exports.remove = remove;
module.exports.oauthCallbackUrl = getOAuthCallbackUrl;
