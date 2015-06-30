
var util = require('./util');
var defaults = require('../defaults');
var path = require('path');
var _ = require('lodash');

function getPackages(target) {
  // get all of the files from gaps_packages
  var ps = _.map(target.packages, function(pKey) {
    var loc = path.join(defaults.PACKAGES_PATH, pKey);
    return util.getFilesFromDisk(loc);
  });

  return Promise.all(ps);
}


module.exports.get = getPackages;
