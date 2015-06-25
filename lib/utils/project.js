
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var authenticate = require('./authenticate');
var request = Promise.promisifyAll(require('request'));
var google = require('googleapis');
var errors = require('./errors');
var colors = require('colors');

var DOWNLOAD_URL = 'https://script.google.com/feeds/download/export?format=json&id=';

function getProjectById(fileId) {
  return Promise.resolve()
    .then(authenticate)
    .then(function(auth) {
      return Promise.all([
        getProjectTitle(fileId, auth),
        getProjectFiles(fileId, auth)
      ]);
    })
    .spread(function(title, files) {
      return {
        title: title,
        files: files,
        id: fileId
      };
    })
    .catch(function(err) {
      console.log(errors.fileIdNotFound.red);
      throw err;
    });
}

function getProjectTitle(fileId, auth) {
  var drive = google.drive({ version: 'v2', auth: auth });
  return Promise.promisify(drive.files.get)({fileId: fileId})
    .then(function(res) {
      return res.title;
    });
}

function getProjectFiles(fileId, auth) {
  var options = {
    url: DOWNLOAD_URL + fileId,
    qs :{ 'access_token' : auth.credentials.access_token }
  };

  return request.getAsync(options)
    .spread(function(res, body) {
      return JSON.parse(body);
    })
    .then(function(project) {
      if (!project.files) {
        throw errors.noFiles;
      }
      return project.files;
    })
    .catch(SyntaxError, function(e) {
      console.log('Error parsing project files'.red);
      throw e;
    })
    .error(function(e) {
      throw e;
    });
}

module.exports.getProjectById = getProjectById;
