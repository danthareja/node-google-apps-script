
var Promise = require('bluebird');
var google = require('googleapis');
var authenticate = require('../utils/authenticate');
var manifestor = require('../utils/manifestor');
var colors = require('colors');
var syncManifest = require('../utils/syncManifest');

module.exports = function upload() {
  return manifestor.get()
    .then(function(manifest) {
      console.log('Pushing ' + manifest.path + ' back up to Google Drive...');
      return syncManifest(manifest.id, manifest.path);
    })
    .then(manifestor.build)
    .then(sendToGoogle)
    .then(function() {
      console.log('Great success!'.green);
    })
    .catch(function(err) {
      console.log('Error running upload command'.red);
      throw err;
    });
};

function sendToGoogle(manifest) {
  return authenticate()
    .then(function(auth) {
      var drive = google.drive({ version: 'v2', auth: auth });
      var options = {
        fileId: manifest.id,
        media: {
          mimeType: 'application/vnd.google-apps.script+json',
          body: JSON.stringify({ files: manifest.files })
        }
      };

      return Promise.promisify(drive.files.update)(options)
        .then(function() {
          return manifest;
        });
    });
}
