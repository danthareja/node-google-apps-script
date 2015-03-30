var Q = require('q');
var fs = require('fs');
var path = require('path');
var rimraf = require('rimraf');
var config = require('./config');
var util = require('./utils');

// Completely overwrites existing project folder
module.exports = function(project) {
  return removeExistingProject(project)
    .then(createProjectFolder)
    .then(addProjectFiles)
    .catch(util.logError);
};

function removeExistingProject(project) {
  var deferred = Q.defer();
  var filepath = path.join(config.CLONE_PATH_BASE, project.title);
  rimraf(filepath, function(err) {
    if (err) return deferred.reject(err);
    deferred.resolve(project);
  });
  // Add filepath property to be referencedgit s the promise chain
  project.filepath = filepath;
  return deferred.promise;
}

function createProjectFolder(project) {
  var deferred = Q.defer();
  fs.mkdir(project.filepath, function(err) {
    if (err) return deferred.reject(err);
    deferred.resolve(project);
  });
  return deferred.promise;
}

function addProjectFiles(project) {
  var writeFilePromises = project.files.map(function(file) {
    var deferred = Q.defer();
    var filename = file.name + getFileExtension(file);
    fs.writeFile(path.join(project.filepath, filename), file.source, function(err) {
      if (err) return deferred.reject(err);
      deferred.resolve();
    });
    return deferred.promise;
  });
  return Q.all(writeFilePromises);
}

function getFileExtension(file) {
  if (file.type === 'server_js') return '.js';
  if (file.type === 'html') return '.html';
  throw new Error('Unsupported file type found');
}