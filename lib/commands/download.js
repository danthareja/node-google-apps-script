var Q = require('q');
var _ = require('underscore');
var request = require('request');
var google = require('googleapis');
var authenticate = require('../utils/authenticate');
var clone = require('../utils/clone');
var config = require('../config');
var projectUtils = require('../utils/project');

module.exports = function(fileId, dest) {
  dest = _.isString(dest) ? dest : null;
  return projectUtils.getProjectById(fileId)
    .then(_(clone).partial(_, dest))
    .then(function(project) {
      console.log('All done!');
      return project;
    })
    .catch(function(err) {
      console.log('Error running download command', err);
    });
}
