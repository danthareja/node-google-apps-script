
var Promise = require('bluebird');
var _ = require('lodash');
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');
var config = require('../config');
var projectUtils = require('../utils/project');
var path = require('path');
var manifestor = require('../utils/manifestor');

module.exports = function init(fileId, subdir) {
  subdir = subdir || '';
  return syncManifest(fileId, subdir)
    .then(function() {
      console.log('All done!');
    })
    .catch(function(err) {
      console.log('Error running init command'.red);
      throw err;
    });
};

