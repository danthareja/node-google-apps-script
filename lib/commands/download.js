
var clone = require('../utils/clone');
var projectUtils = require('../utils/project');
var colors = require('colors');
var _ = require('lodash');
var manifestor = require('../utils/manifestor');

module.exports = function download(fileId, dest) {
  dest = _.isString(dest) ? dest : null;
  fileIdPromise = _.isString(fileId) ?
    Promise.resolve(fileId) :
    manifestor.get(dest).then(function(manifest) {
      return manifest.id;
    });

  fileIdPromise.then(function(id) {
    return projectUtils.getProjectById(id)
      .then(function(manifest) {
        return clone(manifest, dest);
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
