
var path = require('path');
var config = require('../config');
var projectUtils = require('../utils/project');
var manifestor = require('./manifestor');
var colors = require('colors');

/**
  syncManifest is required to get a list of existing files on the server
  (so we know during upload whether or not to use an existing ID)

  downloads the manifest from the server and places it in subdir
*/

module.exports = function syncManifest(fileId, subdir) {
  return projectUtils.getProjectById(fileId)
    .then(function(manifest) {
      manifest.path = subdir;
      return manifest;
    })
    .then(manifestor.set)
    .catch(function(err) {
      console.log('Error while syncing manifest'.red);
      throw err;
    });
};
