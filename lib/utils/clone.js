
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');
var rimraf = Promise.promisify(require('rimraf'));
var mkdirp = Promise.promisify(require('mkdirp'));
var defaults = require('../defaults');
var manifestor = require('./manifestor');

// Updates local copy of Google Apps Script project contents
module.exports = function(manifest, subdir) {
  return removeExistingProject(manifest, subdir)
    .then(createProjectFolder)
    .then(manifestor.set)
    .then(addProjectFiles)
    .catch(function(err) {
      console.log('Error in clone module'.red);
      throw err;
    });
};

function removeExistingProject(manifest, subdir) {
  var destination = subdir || defaults.DEFAULT_SUBDIR;

  return rimraf(subdir)
    .then(function() {
      manifest.path = subdir;
      return manifest;
    });
}

function createProjectFolder(manifest) {
  return mkdirp(manifest.path)
    .then(function() {
      return manifest;
    });
}

function addProjectFiles(manifest) {
  var writeFilePromises = manifest.files.map(function(file) {
    var filepath = path.join(manifest.path, file.name + getFileExtension(file));
    return fs.writeFileAsync(filepath, file.source);
  });
  return Promise.all(writeFilePromises);
}

function getFileExtension(file) {
  if (file.type === 'server_js') return '.js';
  if (file.type === 'html') return '.html';
  throw new Error('Unsupported file type found');
}
