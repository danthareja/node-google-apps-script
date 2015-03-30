var Q = require('q');
var fs = require('fs');
var path = require('path');
var google = require('googleapis');
var authenticate = require('./lib/authenticate');
var config = require('./lib/config');
var util = require('./lib/utils');
var updateManifest = require('./lib/manifestor');
var error = moduleErrors();

var projectPath = util.getArgumentFromCli(2, error.pathNotFound);

getManifestFromProject(projectPath)
  .then(updateManifest)
  .tap(console.log)
  .then(sendToGoogle)
  .catch(util.logError);

function getManifestFromProject(projectPath) {
  var deferred = Q.defer();
  fs.readFile(path.join(projectPath, config.MANIFEST_NAME), function(err, res) {
    if (err) return deferred.reject(err);

    var manifest = JSON.parse(res);
    if (!manifest.files) return deferred.reject(error.wrongManifest);
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
      deferred.resolve(res);
    })
  });
  return deferred.promise;
}

function moduleErrors() {
  return {
    pathNotFound: 'Project path not found. Double check your path and try again',
    wrongManifest: 'The provided path doesn\'t seem to be an imported Google Apps Script project.\n' +
                   'Make sure to you have input the proper path to your project and try again.\n' +
                   'If you haven\'t imported a project yet, run import.js first'
  };
}
