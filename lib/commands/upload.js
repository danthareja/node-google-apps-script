
var Promise = require('bluebird');
var google = require('googleapis');
var authenticate = require('../utils/authenticate');
var manifestor = require('../utils/manifestor');
var colors = require('colors');
var defaults = require('../defaults');
var _ = require('lodash');

module.exports = function upload(targetKey) {

  targetKey = targetKey || defaults.DEFAULT_TARGET;
  console.log('Pushing ' + targetKey + ' back up to Google Drive...');

  var target;

  return Promise.resolve()
    .then(manifestor.get)
    .then(function(config) {

      if (!_.has(config.targets, targetKey)) {
        throw new Error('No target named ' + targetKey);
      }

      target = config.targets[targetKey];

      return manifestor.getExternalFiles(target.id);
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
