
var Promise = require('bluebird');
var packages = require('../utils/packages');
var manifestor = require('../utils/manifestor');
var _ = require('lodash');
var colors = require('colors');

function addPackage(p, options) {
  return packages.download(p)
    .then(manifestor.get)
    .then(function(config) {

      return eachDeployment(config, options, function(dep) {
        dep.packages.push(p);
        dep.packages = _.uniq(dep.packages);
      });
    })
    .then(manifestor.set)
    .then(function() {
      console.log(('Package ' + p + ' downloaded.').green);
    })
    .catch(function(err) {
      console.log('Error downloading package...'.red);
      throw err;
    });
}

function removePackage(p, options) {
  return manifestor.get()
    .then(function(config) {
      return eachDeployment(config, options, function(dep) {
        dep.packages = _.without(dep.packages, p);
      });
    })
    .then(manifestor.set)
    .then(packages.remove(p))
    .then(function() {
      console.log('Removed package ' + p);
    });
}

function updatePackage(p, options) {
  return manifestor.get()
    .then(function(config) {
      return Promise.all(mapDeployments(config, options, function(dep) {
        return dep.packages;
      }))
      .then(_.flatten)
      .then(_.uniq)
      .then(function(ps) {
        return Promise.all(_.map(ps, function(pack) {
          return packages.download(pack);
        }));
      });
    })
    .then(function() {
      if (p === undefined) {
        console.log('Updated all packages');
      } else {
        console.log('Package ' + p.green + ' updated');
      }
    });
}

function getDeploymentsToModify(config, options) {
  var deploymentsToModify = [];

  if (options.all || options.deployment === undefined) {
    deploymentsToModify = config.deployments;
  } else {
    deploymentsToModify.push(_.findWhere(config.deployments, {id: options.deployment}));
  }

  return deploymentsToModify;
}

function eachDeployment(config, options, fn) {
  var deps = getDeploymentsToModify(config, options);
  _.each(deps, fn);
  return config;
}

function mapDeployments(config, options, fn) {
  var deps = getDeploymentsToModify(config, options);
  return _.map(deps, fn);
}

module.exports.add = addPackage;
module.exports.remove = removePackage;
module.exports.update = updatePackage;
