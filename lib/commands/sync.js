
var Q = require('q');
var fs = require('fs');
var path = require('path');
var config = require('../config');
var syncManifest = require('../utils/syncManifest');

module.exports = function(subdir) {
  var p = subdir ? path.join(process.cwd(), subdir) : process.cwd();
  return getManifestFromProject(p)
    .then(function(manifest) {
      return syncManifest(manifest.id, p);
    })
    .then(function(manifest) {
      console.log('Synced Manifest!');
    })
    .catch(console.log.bind(console));
};

function getManifestFromProject(projectPath) {
  var deferred = Q.defer();
  fs.readFile(path.join(projectPath, config.MANIFEST_NAME), function(err, res) {
    if (err) return deferred.reject(err);

    var manifest = JSON.parse(res);
    manifest.path = projectPath;
    if (!manifest.files) return deferred.reject(errors.wrongManifest);
    deferred.resolve(manifest);
  });
  return deferred.promise;
}
