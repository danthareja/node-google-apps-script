
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');
var config = require('../config');
var syncManifest = require('../utils/syncManifest');
var manifestor = require('../utils/manifestor');

module.exports = function sync(subdir) {
  subdir = subdir || '';

  return manifestor.get(subdir).get('id')
  .then(function(fileId) {
    return syncManifest(fileId, subdir);
  })
  .then(function() {
    console.log('Synced Manifest!');
  })
  .catch(function(err) {
    console.log('Error running sync command'.red);
    throw err;
  });
};
