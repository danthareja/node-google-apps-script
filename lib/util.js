const _ = require('lodash');
const dir = require('node-dir');
const path = require('path');
const Promise = require('bluebird');

function getFilesFromDisk(subdir) {
  return (
    new Promise((resolve, reject) => {
      const filesOnDisk = [];

      // Only iterate through supported .js, .gs and .html files in dir
      dir.readFiles(
        subdir,
        { match: /\.js$|\.gs$|\.html$|^appsscript\.json$/ },
        // Invoke this callback on each file
        (err, content, filename, next) => {
          if (err) return reject(err);

          // Parse file's absolute path and add its content to result object
          file = path.parse(filename);
          file.content = content;

          filesOnDisk.push(file);

          // Continue to next file
          next();
        },
        // finished callback.
        err => {
          if (err) return reject(err);
          resolve(filesOnDisk);
        }
      );
    })
      // swallow ENOENT
      .error(() => [])
  );
}

function updateFileSource(existingFile, newFile) {
  existingFile.source = newFile.content;
}

function hasFileOnDisk(filesOnDisk, file) {
  return _.some(filesOnDisk, fileOnDisk => {
    const sameName = file.name === fileOnDisk.name;
    const sameType = file.type === getFileType(fileOnDisk);
    return sameName && sameType;
  });
}

function getFileType(file) {
  if (file.ext === '.js') return 'server_js';
  if (file.ext === '.gs') return 'server_js';
  if (file.ext === '.html') return 'html';
  if (file.ext === '.json') return 'json';
  throw new Error(
    'Unsupported file type found. Google Apps Script only allows appscript.json, .js, and .html'
  );
}

function getFileExtension(file) {
  if (file.type === 'server_js') return '.js';
  if (file.type === 'html') return '.html';
  if (file.type === 'json') return '.json';
  throw new Error('Unsupported file type found');
}

module.exports.getFilesFromDisk = getFilesFromDisk;
module.exports.updateFileSource = updateFileSource;
module.exports.hasFileOnDisk = hasFileOnDisk;
module.exports.getFileType = getFileType;
module.exports.getFileExtension = getFileExtension;
