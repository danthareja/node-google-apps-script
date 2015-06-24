var Q = require('q');
var fs = require('fs');
var path = require('path');
var config = require('../config');
var projectUtils = require('../utils/project');

/**
  syncManifest is required to get a list of existing files on the server
  (so we know during upload whether or not to use an existing ID)
*/

module.exports = function(fileId, dir) {
  return projectUtils.getProjectById(fileId)
    .then(function(project) {
      // Persist project in JSON format so we can update easily
      var deferred = Q.defer();
      var filepath = path.join(dir, config.MANIFEST_NAME);
      fs.writeFile(filepath, JSON.stringify(project, "", 2), function(err) {
        if (err) return deferred.reject(err);
        deferred.resolve(project);
      });
      return deferred.promise;
    });
};
