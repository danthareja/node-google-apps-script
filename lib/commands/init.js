var Q = require('q');
var _ = require('underscore');
var fs = require('fs');
var path = require('path');
var authenticate = require('../utils/authenticate');
var clone = require('../utils/clone');
var config = require('../config');
var projectUtils = require('../utils/project');
var path = require('path');

module.exports = function(fileId, subdir) {
  return projectUtils.getProjectById(fileId)
    .then(removeCodeGs)
    .then(function(project) {
      project.path = subdir ? path.join(process.cwd(), subdir) : process.cwd();
      return project;
    })
    .then(writeManifest)
    .then(function(project) {
      console.log('All done!');
      return project;
    })
    .catch(function(err) {
      console.log('Error running init command', err);
    });
};

function removeCodeGs(project) {
  project.files = _.filter(project.files, function(file) {
    return !(file.name === 'Code' && file.type === 'server_js');
  });
  return project;
}

// Persist project in JSON format so we can update easily
function writeManifest(project) {
  var deferred = Q.defer();
  var filepath = path.join(project.path, config.MANIFEST_NAME);
  fs.writeFile(filepath, JSON.stringify(project, "", 2), function(err) {
    if (err) return deferred.reject(err);
    deferred.resolve(project);
  });
  return deferred.promise;
}
