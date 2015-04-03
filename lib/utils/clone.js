var Q = require('q');
var fs = require('fs');
var path = require('path');
var rimraf = require('rimraf');
var mkdirp = require('mkdirp');
var _ = require('underscore');
var config = require('../config');

// Updates local copy of Google Apps Script project contents
module.exports = function(project, dest) {
  return removeExistingProject(project, dest)
    .then(createProjectFolder)
    .then(writeManifest)
    .then(addProjectFiles)
    .catch(function(err) {
      console.log('Error in clone module', err);
    });
};

function removeExistingProject(project, dest) {
  var deferred = Q.defer();
  var destination = dest || config.CLONE_DESTINATION_BASE || process.cwd();
  var filepath = path.join(destination, project.title);
  // TODO: Confirm if path already exists
  rimraf(filepath, function(err) {
    if (err) return deferred.reject(err);
    // Add absolute path to be referenced down the promise chain
    project.path = path.resolve(filepath);
    deferred.resolve(project);
  });
  return deferred.promise;
}

function createProjectFolder(project) {
  var deferred = Q.defer();
  mkdirp(project.path, function(err) {
    if (err) return deferred.reject(err);
    deferred.resolve(project);
  });
  return deferred.promise;
}

// Persist project in JSON format so we can update easily
function writeManifest(project) {
  var deferred = Q.defer();
  var filepath = path.join(project.path, config.MANIFEST_NAME);
  fs.writeFile(filepath, JSON.stringify(project, "", 2), function(err) {
    if (err) return deferred.reject(err);
    deferred.resolve(project);
  });
  return deferred.promise;
}

function addProjectFiles(project) {
  var writeFilePromises = project.files.map(function(file) {
    var deferred = Q.defer();
    var filepath = path.join(project.path, file.name + getFileExtension(file));
    fs.writeFile(filepath, file.source, function(err) {
      if (err) return deferred.reject(err);
      deferred.resolve();
    });
    return deferred.promise;
  });
  return Q.all(writeFilePromises)
	  .then(_.constant(project));
}

function getFileExtension(file) {
  if (file.type === 'server_js') return '.js';
  if (file.type === 'html') return '.html';
  throw new Error('Unsupported file type found');
}