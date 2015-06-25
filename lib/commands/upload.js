
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var google = require('googleapis');
var authenticate = require('../utils/authenticate');
var manifestor = require('../utils/manifestor');
var colors = require('colors');
var projectUtils = require('../utils/project');
var syncManifest = require('../utils/syncManifest');

module.exports = function upload(subdir) {
  subdir = subdir || '';
  console.log('Pushing ' + subdir + ' back up to Google Drive...');
  return manifestor.get(subdir)
    .then(function(manifest) {
      return syncManifest(manifest.id, subdir);
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
