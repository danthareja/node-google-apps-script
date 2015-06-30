var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var dir = require('node-dir');
var path = require('path');
var defaults = require('../defaults');
var authenticate = require('./authenticate');
var request = Promise.promisifyAll(require('request'));
var errors = require('./errors');
var colors = require('colors');
var _ = require('lodash');

var DOWNLOAD_URL = 'https://script.google.com/feeds/download/export?format=json&id=';

/**
  build generates a manifest to be uploaded to google drive
  @param externalFiles {Object} files in the cloud
  @param target {Object} target (containing .id and optionally .path)
  @return {Object} manifest
 */
var build = function(externalFiles, target) {

  return Promise.resolve()
    .then(getConfig)
    .then(function(config) {
      var filePromises = [
        getFilesFromDisk(config.path),
        // @TODO(Shrugs) - only include packages based on target
        getFilesFromDisk(defaults.PACKAGES_PATH)
      ];

      if (_.has(target, 'path')) {
        filePromises.push(
          getFilesFromDisk(target.path)
        );
      }

      return Promise.all(filePromises)
        .then(_.flatten);

    })
    .then(function(files) {

      var filesToUpload = _.filter(externalFiles, function(eFile) {
        // for each manifest file, if it has an equivalent on disk, keep it
        // otherwise trash it
        return hasFileOnDisk(files, eFile);
      });

      files.forEach(function(file) {
        // Add new file or update existing record
        var manifestFile = getFileInManifest(filesToUpload, file);
        if (manifestFile === undefined) {
          // add
          filesToUpload.push({
            name: file.name,
            type: getFileType(file),
            source: file.content
          });

        } else {
          // update
          updateFileSource(manifestFile, file);
        }
      });

      return {
        id: target.id,
        files: filesToUpload
      };

    });
};


function getFilesFromDisk(subdir) {
  return new Promise(function(resolve, reject) {

    var filesOnDisk = [];

    // Only iterate through supported .js and .html files in dir
    dir.readFiles(subdir, { match: /.js$|.html$/ },
      // Invoke this callback on each file
      function(err, content, filename, next) {
        if (err) return reject(err);

        // Parse file's absolute path and add its content to result object
        file = path.parse(filename);
        file.content = content;

        filesOnDisk.push(file);

        // Continue to next file
        next();
      },
      // finished callback. Write updated manifest back to file
      function(err) {
        if (err) return reject(err);
        resolve(filesOnDisk);
      });
  })
  .error(function() {
    // swallow ENOENT
    return [];
  });
}

function updateFileSource(existingFile, newFile) {
  existingFile.source = newFile.content;
}

function hasFileOnDisk(filesOnDisk, file) {
  for (var i = 0; i < filesOnDisk.length; i++) {
    var sameName = file.name === filesOnDisk[i].name;
    var sameType = file.type === getFileType(filesOnDisk[i]);
    if (sameName && sameType) return true;
  }
  return false;
}

function getFileInManifest(files, file) {
  return _.findWhere(files, {
    name: file.name,
    type: getFileType(file)
  });
}

function getFileType(file) {
  if (file.ext === '.js') return 'server_js';
  if (file.ext === '.html') return 'html';
  throw new Error('Unsupported file type found. Google Apps Script only allows .js and .html');
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
