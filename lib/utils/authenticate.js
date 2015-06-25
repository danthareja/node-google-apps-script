
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var OAuth2Client = require('googleapis').auth.OAuth2;
var config = require('../config');
var colors = require('colors');
var errors = require('./errors');

module.exports = function authenticate() {
  return getCredentials()
    .then(createAuthClient)
    .catch(function(err) {
      console.log('Error in authenticate module', err);
    });
};

function getCredentials() {
  return fs.readFileAsync(config.STORAGE_FILE)
    .then(JSON.parse)
    .catch(SyntaxError, function(e) {
      console.log('Could not parse credentials'.red);
    })
    .error(function(e) {
      console.log(errors.wrongCredentialPath);
      throw e;
    });
}

function createAuthClient(credentials) {
  var auth = new OAuth2Client(credentials.client_id,
                              credentials.client_secret,
                              credentials.redirect_uri);
  // refreshAccessToken requires refresh_token to be set
  auth.credentials.refresh_token = credentials.refresh_token;
  return new Promise(function(resolve, reject) {
    auth.refreshAccessToken(function(err, tokens) {
      if (err) { reject(err); }
      auth.setCredentials(tokens);
      resolve(auth);
    });
  });
}
