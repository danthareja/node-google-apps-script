
var _ = require('lodash');
var manifestor = require('./manifestor');

function targetForId(id) {
  return manifestor.get()
    .then(function(config) {
      return _.findWhere(config.targets, {
        id: id
      });
    });
}

module.exports.targetForId = targetForId;
