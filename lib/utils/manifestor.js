var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');
var defaults = require('../defaults');
var authenticate = require('./authenticate');
var request = Promise.promisifyAll(require('request'));
var errors = require('./errors');
var colors = require('colors');
var _ = require('lodash');
var util = require('./util');

/**
  build generates a manifest to be uploaded to google drive
  @param externalFiles {Object} files in the cloud
  @return {Object} manifest
 */
var build = function(externalFiles) {

  return getConfig().get('path')
    .then(util.getFilesFromDisk)
    .then(function(files) {

      // for each manifest file, if it has an equivalent on disk, keep it
      // otherwise trash it
      var filesToUpload = _.filter(externalFiles, function(eFile) {
        return util.hasFileOnDisk(files, eFile);
      });

      files.forEach(function(file) {
        // Add new file or update existing record
        var manifestFile = getFileInManifest(filesToUpload, file);
        if (manifestFile === undefined) {
          // add
          filesToUpload.push({
            name: file.name,
            type: util.getFileType(file),
            source: file.content
          });

        } else {
          // update
          util.updateFileSource(manifestFile, file);
        }
      });

      return filesToUpload;

    });
};

function getFileInManifest(files, file) {
  return _.findWhere(files, {
    name: file.name,
    type: util.getFileType(file)
  });
}

function getExternalFiles(fileId) {
  return Promise.resolve()
    .then(authenticate)
    .then(function(auth) {
      return getProjectFiles(fileId, auth);
    })
    .catch(function(err) {
      console.log(errors.fileIdNotFound.red);
      throw err;
    });
}


function getProjectFiles(fileId, auth) {
  var options = {
    url: defaults.DOWNLOAD_URL + fileId,
    qs : {
      'access_token': auth.credentials.access_token
    }
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

function throwIfConfig() {
  return fs.readFileAsync(defaults.CONFIG_NAME)
    .then(JSON.parse)
    .then(function() {
      throw 'Config already exists. Cowardly refusing to overwrite.';
    })
    .error(function() {
      // swallow error
    });
}

function getConfig() {
  return fs.readFileAsync(defaults.CONFIG_NAME)
    .then(JSON.parse)
    .catch(SyntaxError, function(e) {
      console.log('Error parsing config'.red);
      throw e;
    })
    .error(function(e) {
      console.log('Config does not exist'.red);
      throw e;
    });
}

function setConfig(config) {
  return fs.writeFileAsync(defaults.CONFIG_NAME, JSON.stringify(config, "", 2))
    .then(function() {
      return config;
    });
}

module.exports.build = build;
module.exports.get = getConfig;
module.exports.set = setConfig;

module.exports.getExternalFiles = getExternalFiles;
module.exports.throwIfConfig = throwIfConfig;
