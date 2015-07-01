
var util = require('./util');
var defaults = require('../defaults');
var path = require('path');
var _ = require('lodash');
var Promise = require('bluebird');
var request = require('request');
var getAsync = Promise.promisify(request.get);
var mkdirp = Promise.promisify(require('mkdirp'));
var fs = require('fs');

function getPackages(target) {
  // get all of the files from gaps_packages
  var ps = _.map(target.packages, function(pKey) {
    var loc = path.join(defaults.PACKAGES_PATH, pKey);
    return util.getFilesFromDisk(loc);
  });

  return Promise.all(ps);
}


function downloadPackage(p) {
  // get /package/latest/package.json (handle errors of no package)
  // map that list of files and request each one
  // write each one to disk at
  // PACKAGES_PATH / package / file
  // call it a day
  var packageRoot = defaults.PACKAGES_ROOT + '/' + p + '/latest/';
  var packageJSON = packageRoot + 'package.json';

  return Promise.resolve()
    .then(function() {
      return mkdirp(path.join(defaults.PACKAGES_PATH, p));
    })
    .then(function() {
      return getAsync(packageJSON);
    })
    .spread(function(res, body) {
      return JSON.parse(body);
    })
    .catch(SyntaxError, function() {
      console.log(('Package ' + p + ' Not Found').red);
      throw err;
    })
    .then(function(pConfig) {
      return Promise.all(_.map(pConfig.main, function(endpoint) {

        var loc = path.join(defaults.PACKAGES_PATH, p, endpoint);
        loc = util.swapGStoJS(loc);
        var dirname = path.dirname(loc);
        return mkdirp(dirname)
          .then(function() {
            return new Promise(function(resolve, reject) {
              var ws = fs.createWriteStream(loc);
              request(packageRoot + endpoint).pipe(ws)
                .on('end', function() {
                  resolve();
                })
                .on('error', reject);
            });
          });
      }));
    });

}

module.exports.get = getPackages;
module.exports.download = downloadPackage;
