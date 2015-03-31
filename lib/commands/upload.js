var Q = require('q');
var fs = require('fs');
var path = require('path');
var google = require('googleapis');
var authenticate = require('../utils/authenticate');
var updateManifest = require('../utils/manifestor');
var config = require('../config');
var error = moduleErrors();

module.exports = function() {
  console.log('Pushing back up to Google Drive...');
  getManifestFromProject(process.cwd())
    .then(updateManifest)
    .then(sendToGoogle)
    .then(function() {
      console.log('Great success!')
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
