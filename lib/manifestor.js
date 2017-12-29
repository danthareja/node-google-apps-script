const _ = require('lodash');
const path = require('path');
const colors = require('colors');

const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const request = Promise.promisifyAll(require('request'), { multiArgs: true });

const util = require('./util');
const defaults = require('./defaults');
const authenticate = require('./authenticate');

/**
  build generates a manifest to be uploaded to google drive
  @param externalFiles {Object} files in the cloud
  @return {Object} manifest
 */
const build = function(externalFiles) {
  return getConfig()
    .get('path')
    .then(util.getFilesFromDisk)
    .then(files => {
      // for each manifest file, if it has an equivalent on disk, keep it
      // otherwise trash it
      const filesToUpload = _.filter(externalFiles, externalFile =>
        util.hasFileOnDisk(files, externalFile)
      );

      _.each(files, file => {
        // Add new file or update existing record
        const manifestFile = getFileInManifest(filesToUpload, file);
        if (manifestFile === undefined) {
          // add
          filesToUpload.push({
            name: file.name,
            type: util.getFileType(file),
            source: file.content,
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
  return _.find(files, {
    name: file.name,
    type: util.getFileType(file),
  });
}

function getExternalFiles(fileId) {
  return authenticate()
    .then(auth => getProjectFiles(fileId, auth))
    .catch(err => {
      console.log(
        'Script file ID not found. Please input an ID and try again.'.red
      );
      throw err;
    });
}

function getProjectFiles(fileId, auth) {
  const options = {
    url: defaults.DOWNLOAD_URL + fileId,
    qs: {
      access_token: auth.credentials.access_token,
    },
  };

  return request
    .getAsync(options)
    .spread((res, body) => JSON.parse(body))
    .then(project => {
      if (!project.files) {
        throw 'Looks like there are no files associated with this project. Check the id and try again.';
      }
      return project.files;
    })
    .catch(SyntaxError, err => {
      console.log('Error parsing project files'.red);
      throw err;
    })
    .error(err => {
      throw err;
    });
}

function throwIfConfig() {
  return fs
    .readFileAsync(defaults.CONFIG_NAME)
    .then(JSON.parse)
    .then(() => {
      throw 'Config already exists. Cowardly refusing to overwrite.';
    })
    .error(() => {
      // swallow error
    });
}

function getConfig() {
  return fs
    .readFileAsync(defaults.CONFIG_NAME)
    .then(JSON.parse)
    .catch(SyntaxError, err => {
      console.log('Error parsing config'.red);
      throw err;
    })
    .error(err => {
      console.log('Config does not exist'.red);
      throw err;
    });
}

function setConfig(config) {
  return fs
    .writeFileAsync(defaults.CONFIG_NAME, JSON.stringify(config, '', 2))
    .then(() => config);
}

module.exports.build = build;
module.exports.get = getConfig;
module.exports.set = setConfig;
module.exports.getExternalFiles = getExternalFiles;
module.exports.throwIfConfig = throwIfConfig;
