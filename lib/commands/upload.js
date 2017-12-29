const _ = require('lodash');
const colors = require('colors');
const google = require('googleapis');
const Promise = require('bluebird');

const defaults = require('../defaults');
const manifestor = require('../manifestor');
const authenticate = require('../authenticate');

module.exports = function upload() {
  console.log('Pushing back up to Google Drive...');

  let fileId; // Hold in closure to avoid promise nesting

  return manifestor
    .get()
    .then(config => {
      fileId = config.fileId;
      return manifestor.getExternalFiles(fileId);
    })
    .then(externalFiles => manifestor.build(externalFiles))
    .then(files => sendToGoogle(files, fileId))
    .then(() => {
      console.log(
        'The latest files were successfully uploaded to your Apps Script project.'
          .green
      );
    })
    .catch(err => {
      console.log('Upload failed.'.red);
    });
};

function sendToGoogle(files, id) {
  if (!files.length) {
    console.log('No Files to upload.'.red);
    throw 'manifest file length is 0';
  }

  return authenticate().then(auth => {
    const drive = google.drive({ version: 'v2', auth: auth });
    const options = {
      fileId: id,
      media: {
        mimeType: 'application/vnd.google-apps.script+json',
        body: JSON.stringify({ files: files }),
      },
    };

    return Promise.promisify(drive.files.update)(options).catch(err => {
      console.log(
        'An error occured while running upload command: '.red + err.message
      );
      throw err;
    });
  });
}
