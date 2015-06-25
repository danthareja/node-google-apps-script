
var syncManifest = require('../utils/syncManifest');
var manifestor = require('../utils/manifestor');

module.exports = function sync() {

  return manifestor.get()
    .then(function(manifest) {
      return syncManifest(manifest.id, manifest.path);
    })
    .then(function() {
      console.log('Synced Manifest!');
    })
    .catch(function(err) {
      console.log('Error running sync command'.red);
      throw err;
    });
};
