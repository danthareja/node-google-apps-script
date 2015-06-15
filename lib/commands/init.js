var Q = require('q');
var _ = require('underscore');
var fs = require('fs');
var path = require('path');
var authenticate = require('../utils/authenticate');
var clone = require('../utils/clone');
var config = require('../config');
var projectUtils = require('../utils/project');

module.exports = function(fileId, cwd) {
  return projectUtils.getProjectById(fileId)
    .then(removeCodeGs)
    .then(function(project) {
      project.path = cwd || process.cwd()
      return project
    })
    .then(writeManifest)
    .then(addProjectFiles)
    .then(function(project) {
      console.log('All done!');
      return project;
    })
    .catch(function(err) {
      console.log('Error running download command', err);
    });
}

function removeCodeGs(project) {
  var deferred = Q.defer();
  project.files = _.filter(project.files, function(file) {
    return !(file.name === 'Code' && file.type === 'server_js')
  });
  deferred.resolve(project);
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
  return Q.all(writeFilePromises).then(_.constant(project));
}

function getFileExtension(file) {
  if (file.type === 'server_js') return '.js';
  if (file.type === 'html') return '.html';
  throw new Error('Unsupported file type found');
}
