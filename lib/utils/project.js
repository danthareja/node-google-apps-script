var Q = require('q');
var authenticate = require('./authenticate');
var request = require('request');
var google = require('googleapis');
var errors = require('./errors');

var DOWNLOAD_URL = 'https://script.google.com/feeds/download/export?format=json&id=';

function getProjectById(fileId) {
  return authenticate().then(function(auth) {
    return Q.all([getProjectTitle(fileId, auth), getProjectFiles(fileId, auth)]);
  })
  .spread(function(title, files) {
    return {
      title: title,
      files: files,
      id: fileId
    };
  });
}

function getProjectTitle(fileId, auth) {
  var deferred = Q.defer();
  var drive = google.drive({ version: 'v2', auth: auth });
  drive.files.get({ fileId: fileId }, function(err, res) {
    if (err) return deferred.reject(err);
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
    var project;
    try {
      project = JSON.parse(body);
    } catch (e) {
      return deferred.reject(e);
    }
    if (!project.files) {
      return deferred.reject(errors.noFiles);
    }
    deferred.resolve(project.files);
  });
  return deferred.promise;
}

module.exports.getProjectById = getProjectById;
