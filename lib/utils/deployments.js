
var _ = require('lodash');
var manifestor = require('./manifestor');

function deploymentForId(id) {
  return manifestor.get()
    .then(function(config) {
      return _.findWhere(config.deployments, {
        id: id
      });
    });
}

module.exports.deploymentForId = deploymentForId;
