
var Promise = require('bluebird');
var google = require('googleapis');
var authenticate = require('../utils/authenticate');
var manifestor = require('../utils/manifestor');
var colors = require('colors');
var defaults = require('../defaults');
var _ = require('lodash');
var deployments = require('../utils/deployments');

module.exports = function upload(depId) {

  depId = depId || defaults.DEFAULT_DEPLOYMENT;
  console.log('Pushing ' + depId + ' back up to Google Drive...');

  var deployment;

  return manifestor.get()
    .then(function(config) {

      return deployments.deploymentForId(depId)
        .then(function(dep) {
          if (dep === undefined) {
            throw new Error('No deployment named ' + depId);
          }

          deployment = dep;
          return manifestor.getExternalFiles(deployment.fileId);
        });
    })
    .then(function(externalFiles) {
      return manifestor.build(externalFiles, deployment);
    })
    .then(sendToGoogle)
    .then(function() {
      console.log('Great success!'.green);
    })
    .catch(function(err) {
      console.log('Error running upload command'.red);
    });
};

function sendToGoogle(manifest) {
  if (!manifest.files.length) {
    console.log('No Files to upload.'.red);
    throw 'manifest file length is 0';
  }
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
        .catch(function() {
          console.log('Google Drive returned a fatal error.'.red);
          throw err;
        });
    });
}
