var _ = require('lodash');
var path = require('path');
var colors = require('colors');

var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var request = Promise.promisifyAll(require('request'));

var util = require('./util');
var defaults = require('./defaults');
var authenticate = require('./authenticate');

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
      var filesToUpload = _.filter(externalFiles, function(externalFile) {
        return util.hasFileOnDisk(files, externalFile);
      });

      _.each(files, function(file) {
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
  return authenticate()
    .then(function(auth) {
      return getProjectFiles(fileId, auth);
    })
    .catch(function(err) {
      console.log('Script file ID not found. Please input an ID and try again.'.red);
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
        throw 'Looks like there are no files associated with this project. Check the id and try again.';
      }
      return project.files;
    })
    .catch(SyntaxError, function(err) {
      console.log('Error parsing project files'.red);
      throw err;
    })
    .error(function(err){ 
      throw err;
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
    .catch(SyntaxError, function(err) {
      console.log('Error parsing config'.red);
      throw err;
    })
    .error(function(err) {
      console.log('Config does not exist'.red);
      throw err;
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
