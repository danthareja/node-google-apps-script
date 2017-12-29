const colors = require('colors');
const mkdirp = require('mkdirp');

const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'), { multiArgs: true });

const util = require('../util');
const defaults = require('../defaults');
const manifestor = require('../manifestor');

module.exports = function init(fileId, options) {
  const subdir = options.subdir || defaults.DEFAULT_SUBDIR;

  if (!fileIdIsValid(fileId)) {
    return;
  }

  const config = {
    path: subdir,
    fileId: fileId,
    key: options.key,
  };

  const overwritePromise = options.overwrite
    ? Promise.resolve()
    : manifestor.throwIfConfig();

  return overwritePromise
    .then(() => manifestor.set(config))
    .then(() => mkdirp(subdir))
    .then(config => manifestor.getExternalFiles(fileId))
    .map(file => writeExternalFile(file, subdir))
    .catch(err => {
      console.log('Error running init command'.red);
      throw err;
    });
};

function writeExternalFile(file, dir) {
  const filename = file.name + util.getFileExtension(file);
  return fs.writeFileAsync(dir + '/' + filename, file.source).catch(err => {
    console.log('Could not write file ' + filename);
    throw err;
  });
}

function fileIdIsValid(fileId) {
  if (fileId.charAt(0).toLowerCase() === 'm') {
    console.log(
      '\nScript file ID error.'.red +
        '\n' +
        'It looks like you are passing in a Project Key, from "File --> Project properties",' +
        "rather than a Drive File ID.\nYou will find the Drive File ID in the script's URL:\n" +
        'https://script.google.com/a/google.com/d/' +
        '__DRIVE_FILE_ID__'.green +
        '/edit.\n'
    );
    return false;
  } else {
    return true;
  }
}
