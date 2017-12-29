const defaults = require('../defaults');
const manifestor = require('../manifestor');

module.exports = function() {
  return manifestor.get().then(config => {
    if (config.key) {
      console.log(
        'https://script.google.com/macros/d/' + config.key + '/usercallback'
      );
    } else {
      console.log('No Project Key provided in ' + defaults.CONFIG_NAME);
    }
  });
};
