var Q = require('q');
var fs = require('fs');
var _ = require('underscore');
var path = require('path');
var google = require('googleapis');
var authenticate = require('../utils/authenticate');
var updateManifest = require('../utils/manifestor');
var config = require('../config');
var errors = require('../utils/errors');
var projectUtils = require('../utils/project');
var syncManifest = require('../utils/syncManifest');

module.exports = function(subdir) {
  var projectPath = _.isString(subdir) ? subdir : process.cwd();
  console.log('Pushing ' + projectPath + ' back up to Google Drive...');
  return getManifestFromProject(projectPath)
    .then(updateManifest)
    .then(sendToGoogle)
    .then(function(manifest) {
      return syncManifest(manifest.id, subdir);
    })
    .then(function() {
      console.log('Great success!');
    })
    .catch(function(err) {
      console.log('Error running upload command', err);
    });
}

function getManifestFromProject(projectPath) {
  var deferred = Q.defer();
  fs.readFile(path.join(projectPath, config.MANIFEST_NAME), function(err, res) {
    if (err) return deferred.reject(err);

    var manifest = JSON.parse(res);
    manifest.path = projectPath;
    if (!manifest.files) return deferred.reject(errors.wrongManifest);
    deferred.resolve(manifest)
  });
  return deferred.promise;
}

function sendToGoogle(manifest) {
  var deferred = Q.defer();
  authenticate().then(function(auth) {
    var drive = google.drive({ version: 'v2', auth: auth });
    var options = {
      fileId: manifest.id,
      media: {
        mimeType: 'application/vnd.google-apps.script+json',
        body: JSON.stringify({ files: manifest.files })
      }
    };

    drive.files.update(options, function(err, res) {
      if (err) return deferred.reject(err);
      deferred.resolve(manifest);
    })
  });
  return deferred.promise;
}
