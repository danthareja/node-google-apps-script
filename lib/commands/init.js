
var syncManifest = require('../utils/syncManifest');

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

