
var Promise = require('bluebird');
var google = require('googleapis');
var authenticate = require('../utils/authenticate');
var manifestor = require('../utils/manifestor');
var colors = require('colors');
var defaults = require('../defaults');
var _ = require('lodash');

module.exports = function upload() {

  console.log('Pushing back up to Google Drive...');

  var fileId;

  return manifestor.get()
    .then(function(config) {
      var fileId = config.fileId;
      return manifestor.getExternalFiles(fileId)
        .then(manifestor.build)
        .then(function(files) {
          return sendToGoogle(files, fileId);
        });
    })
    .then(function() {
      console.log('Great success!'.green);
    })
    .catch(function(err) {
      console.log('Error running upload command'.red);
    });
};

function sendToGoogle(files, id) {
  if (!files.length) {
    console.log('No Files to upload.'.red);
    throw 'manifest file length is 0';
  }
  return authenticate()
    .then(function(auth) {
      var drive = google.drive({ version: 'v2', auth: auth });
      var options = {
        fileId: id,
        media: {
          mimeType: 'application/vnd.google-apps.script+json',
          body: JSON.stringify({ files: files })
        }
      };
      return Promise.promisify(drive.files.update)(options)
        .catch(function(err) {
          console.log('Google Drive returned a fatal error.'.red);
          throw err;
        });
    });
}
