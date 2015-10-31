var colors = require('colors');
var OAuth2Client = require('googleapis').auth.OAuth2;

var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));

var defaults = require('./defaults');

module.exports = function authenticate() {
  return getCredentials()
    .then(createAuthClient)
    .catch(function(err) {
      console.log('Error in authenticate module', err);
    });
};

function getCredentials() {
  return fs.readFileAsync(defaults.STORAGE_FILE)
    .then(JSON.parse)
    .catch(SyntaxError, function(e) {
      console.log('Could not parse credentials'.red);
    })
    .error(function(e) {
      console.log('Could not read path to credentials file. Please check your path and try again'.red);
      throw err;
    });
}

function createAuthClient(credentials) {
  var auth = new OAuth2Client(
    credentials.client_id,
    credentials.client_secret,
    credentials.redirect_uri
  );

  // refreshAccessToken requires refresh_token to be set
  auth.credentials.refresh_token = credentials.refresh_token;
  return new Promise(function(resolve, reject) {
    auth.refreshAccessToken(function(err, tokens) {
      if (err) return reject(err);
      auth.setCredentials(tokens);
      resolve(auth);
    });
  });
}
