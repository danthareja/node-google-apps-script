
var clone = require('../utils/clone');
var projectUtils = require('../utils/project');
var colors = require('colors');
var _ = require('lodash');
var manifestor = require('../utils/manifestor');
var Promise = require('bluebird');

module.exports = function download(fileId, dest) {

  fileIdPromise = fileId !== undefined ?
    Promise.resolve(fileId) :
    manifestor.get().get('id');
  destPromise = dest !== undefined ?
    Promise.resolve(dest) :
    manifestor.get().get('path');

  Promise.join(fileIdPromise, destPromise, function(id, subdir) {
    return projectUtils.getProjectById(id)
      .then(function(manifest) {
        return clone(manifest, subdir);
      })
      .then(function() {
        console.log('All done!');
      })
      .catch(function(err) {
        console.log('Error running download command'.red);
        throw err;
      });
  });
};
