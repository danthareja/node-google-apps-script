
var packages = require('../utils/packages');

function getPackage(p) {
  return packages.download(p)
    .then(function() {
      console.log(('Package ' + p + ' downloaded.').green);
    })
    .catch(function(err) {
      console.log('Error downloading package...'.red);
      throw err;
    });
}

module.exports = getPackage;
