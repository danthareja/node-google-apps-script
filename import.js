var Q = require('q');
var request = require('request');
var google = require('googleapis');
var authenticate = require('./lib/authenticate');
var clone = require('./lib/clone')
var config = require('./lib/config');
var util = require('./lib/utils');

var fileId = util.getArgumentFromCli(2, 'Script file ID not found. Please input an ID and try again.');

getProjectById(fileId)
  .then(clone)
  .catch(util.logError)

function getProjectById(fileId) {
  var project = {};
  var deferred = Q.defer();
  authenticate().then(function(auth) {
    return Q.all([getProjectTitle(fileId, auth), getProjectFiles(fileId, auth)])
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
    deferred.resolve(res.title);
  });
  return deferred.promise;
}

function getProjectFiles(fileId, auth) {
  var deferred = Q.defer();
  var options = {
    url: config.GOOGLE_SCRIPT_DOWNLOAD_URL + fileId,
    qs :{ 'access_token' : auth.credentials.access_token }
  };
  request.get(options, function(err, res, body) {
    if (err) return deferred.reject('Error getting project');
    var project = JSON.parse(body)
    if (!project.files) return deferred.reject('Looks like there are no files associated with this project. Check the id and try again.');
    deferred.resolve(project.files);
  });
  return deferred.promise;
}

