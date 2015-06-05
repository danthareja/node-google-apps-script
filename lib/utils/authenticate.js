var Q = require('q');
var fs = require('fs');
var OAuth2Client = require('googleapis').auth.OAuth2;
var config = require('../config');

module.exports = function() {
  return getCredentials()
    .then(createAuthClient)
    .catch(function(err) {
      console.log('Error in authenticate module', err);
    });
};

function getCredentials() {
  var deferred = Q.defer();
  fs.readFile(config.STORAGE_FILE, function(err, res){
    if (err) return deferred.reject(err);
    if (!res) return deferred.reject('Nothing found in authentication config. Please run init first');
    deferred.resolve(JSON.parse(res));
  })
  return deferred.promise;
}

function createAuthClient(credentials) {
  var deferred = Q.defer();
  var auth = new OAuth2Client(credentials.client_id, credentials.client_secret, credentials.redirect_uri);
  auth.credentials.refresh_token = credentials.refresh_token; // refreshAccessToken requires refresh_token to be set
  auth.refreshAccessToken(function(err, tokens) {
    if (err) return deferred.reject(err);
    auth.setCredentials(tokens);
    deferred.resolve(auth);
  })
  return deferred.promise;
}
