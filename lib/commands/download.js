var Q = require('q');
var _ = require('underscore');
var request = require('request');
var google = require('googleapis');
var authenticate = require('../utils/authenticate');
var clone = require('../utils/clone');
var config = require('../config');
var error = moduleErrors();

var DOWNLOAD_URL = 'https://script.google.com/feeds/download/export?format=json&id=';

module.exports = function(fileId, dest) {
  dest = _.isString(dest) ? dest : null;
  return getProjectById(fileId)
    .then(_(clone).partial(_, dest))
    .then(function(project) {
      console.log('All done!');
      return project;
    })
    .catch(function(err) {
      console.log('Error running download command', err);
    });
}

function getProjectById(fileId) {
  var project = {};
  var deferred = Q.defer();
  authenticate().then(function(auth) {
    return Q.all([getProjectTitle(fileId, auth), getProjectFiles(fileId, auth)]);
  })
  .spread(function(title, files) {
    project.title = title;
    project.files = files;
    project.id = fileId;
    deferred.resolve(project);
  })
  return deferred.promise;
}

function getProjectTitle(fileId, auth) {
  var deferred = Q.defer();
  var drive = google.drive({ version: 'v2', auth: auth });
  drive.files.get({ fileId: fileId }, function(err, res) {
    if (err) return deferred.reject('Error getting project');
    console.log('Cloning into \'' + res.title + '\'...');
    deferred.resolve(res.title);
  });
  return deferred.promise;
}

function getProjectFiles(fileId, auth) {
  var deferred = Q.defer();
  var options = {
    url: DOWNLOAD_URL + fileId,
    qs :{ 'access_token' : auth.credentials.access_token }
  };
  request.get(options, function(err, res, body) {
    if (err) return deferred.reject(err);
    try {
      var project = JSON.parse(body);
    } catch (e) {
      return deferred.reject(e);
    }
    if (!project.files) return deferred.reject(error.noFiles);
    deferred.resolve(project.files);
  });
  return deferred.promise;
}

function moduleErrors() {
  return {
    fileIdNotFound: 'Script file ID not found. Please input an ID and try again.',
    noFiles: 'Looks like there are no files associated with this project. Check the id and try again.'
  }
}