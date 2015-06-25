
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');
var rimraf = Promise.promisify(require('rimraf'));
var mkdirp = Promise.promisify(require('mkdirp'));
var config = require('../config');
var manifestor = require('./manifestor');

// Updates local copy of Google Apps Script project contents
module.exports = function(project, dest) {
  return removeExistingProject(project, dest)
    .then(createProjectFolder)
    .then(manifestor.set)
    .then(addProjectFiles)
    .catch(function(err) {
      console.log('Error in clone module', err);
    });
};

function removeExistingProject(project, dest) {
  var destination = dest || config.CLONE_DESTINATION_BASE || process.cwd();
  var filepath = path.join(destination, project.title);

  return rimraf(filepath)
    .then(function() {
      project.path = path.resolve(filepath);
      return project;
    });
}

function createProjectFolder(project) {
  return mkdirp(project.path)
    .then(function() {
      return project;
    });
}

function addProjectFiles(project) {
  var writeFilePromises = project.files.map(function(file) {
    var filepath = path.join(project.path, file.name + getFileExtension(file));
    return fs.writeFileAsync(filepath, file.source);
  });
  return Promise.all(writeFilePromises)
	  .then(function() {
      return project;
    });
}

function getFileExtension(file) {
  if (file.type === 'server_js') return '.js';
  if (file.type === 'html') return '.html';
  throw new Error('Unsupported file type found');
}
