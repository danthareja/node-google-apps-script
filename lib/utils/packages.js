
var util = require('./util');
var defaults = require('../defaults');
var path = require('path');
var _ = require('lodash');
var Promise = require('bluebird');
var request = require('request');
var getAsync = Promise.promisify(request.get);
var mkdirp = Promise.promisify(require('mkdirp'));
var fs = require('fs');
var rimraf = Promise.promisify(require('rimraf'));

function getPackages(deployment) {
  // get all of the files from gapps_packages
  var ps = _.map(deployment.packages, function(p) {
    var loc = path.join(defaults.PACKAGES_PATH, p);
    return util.getFilesFromDisk(loc)
      .then(function(files) {
        // rename each file based on package prefix
        _.each(files, function(f) {
          f.name = p + '-' + f.name;
        });
        return files;
      });
  });

  return Promise.all(ps);
}

function removePackage(p) {
  var packageDir = path.join(defaults.PACKAGES_PATH, p);
  return rimraf(packageDir);
}


function downloadPackage(p) {
  var packageRoot = defaults.PACKAGES_ROOT + '/' + p + '/latest/';
  var packageJSON = packageRoot + 'package.json';
  var packageDir = path.join(defaults.PACKAGES_PATH, p);

  return Promise.resolve()
    // remove directory
    .then(function() {
      return rimraf(packageDir);
    })
    // create empty directory
    .then(function() {
      return mkdirp(packageDir);
    })
    // get the package.json
    .then(function() {
      return getAsync(packageJSON);
    })
    .spread(function(res, body) {
      return JSON.parse(body);
    })
    .catch(SyntaxError, function(err) {
      console.log(('Syntax Error: Package ' + p + ' Not Found at ' + packageJSON).red);
    })
    .then(function(pConfig) {
      // for each file in the package, promise to get it
      var ps = _.map(pConfig.main, function(endpoint) {
        var loc = path.join(defaults.PACKAGES_PATH, p, endpoint);
        loc = util.swapGStoJS(loc);
        var dirname = path.dirname(loc);
        // create any necessary directories that the package uses
        return Promise.resolve()
          .then(function() {
            return mkdirp(dirname);
          })
          .then(function() {
            // return the promise to stream the package to disk
            return new Promise(function(resolve, reject) {
              var ws = fs.createWriteStream(loc);
              var r = request(packageRoot + endpoint).pipe(ws);
              r.on('end', resolve);
              r.on('close', resolve);
              r.on('error', reject);
            });
          });
      });

      return Promise.all(ps);
    });

}

module.exports.get = getPackages;
module.exports.remove = removePackage;
module.exports.download = downloadPackage;
