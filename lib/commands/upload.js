
var Promise = require('bluebird');
var google = require('googleapis');
var authenticate = require('../utils/authenticate');
var manifestor = require('../utils/manifestor');
var colors = require('colors');
var defaults = require('../defaults');
var _ = require('lodash');
var targets = require('../utils/targets');

module.exports = function upload(targetKey) {

  targetKey = targetKey || defaults.DEFAULT_TARGET;
  console.log('Pushing ' + targetKey + ' back up to Google Drive...');

  var target;

  return manifestor.get()
    .then(function(config) {

      return targets.targetForId(targetKey)
        .then(function(t) {
          if (t === undefined) {
            throw new Error('No target named ' + targetKey);
          }

          target = t;
          return manifestor.getExternalFiles(target.fileId);
        });
    })
    .then(function(externalFiles) {
      return manifestor.build(externalFiles, target);
    })
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
