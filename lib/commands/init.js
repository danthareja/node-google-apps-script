var Q = require('q');
var fs = require('fs');
var readline = require('readline');
var colors = require('colors');
var OAuth2Client = require('googleapis').auth.OAuth2;
var config = require('../config');
var error = moduleErrors();
var auth = {}; // Persisted client credentials

var GOOGLE_AUTH_SCOPE = ['https://www.googleapis.com/auth/drive','https://www.googleapis.com/auth/drive.scripts'];

module.exports = function(path) {
  getCredentialsFromFile(path)
    .then(authenticateWithGoogle)
    .then(saveAuthenticationConfig)
    .then(shutdownSafely)
    .catch(function(err) {
      console.log('Error running init command', err);
    });
}

function getCredentialsFromFile(path) {
  var deferred = Q.defer();
  fs.readFile(path, function(err, res) {
    if (err) return deferred.reject(error.wrongCredentialPath);
    if (!res) return deferred.reject();

    var credentials = JSON.parse(res);
    if (!credentials.web) return deferred.reject(error.wrongCredentialsFile);

    // Add important auth information to persist
    auth.client_id = credentials.web.client_id;
    auth.client_secret = credentials.web.client_secret;
    auth.redirect_uri = credentials.web.redirect_uris[0];

    return deferred.resolve(credentials.web);
  });
  return deferred.promise;
}

function authenticateWithGoogle(credentials) {
  var deferred = Q.defer();
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  var oauth2Client = new OAuth2Client(credentials.client_id, credentials.client_secret, credentials.redirect_uris[0]);
  var url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Required to receive a refresh token
    scope: GOOGLE_AUTH_SCOPE
  });

  console.log('\nPlease visit the following url in your browser (you\'ll only have to do this once):'.cyan, url.green);
  console.log('\nLook in the url for ?code=XXXXXXXXX and copy everything after the \'=\''.yellow)
  rl.question('Enter the code here: ', getAccessToken);

  function getAccessToken(code) {
    oauth2Client.getToken(code, function(err, tokens) {
      if (err) return deferred.reject(err);
      auth.refresh_token = tokens.refresh_token;
      deferred.resolve();
    });
  };
  return deferred.promise;
}

function saveAuthenticationConfig() {
  var deferred = Q.defer();
  fs.writeFile(config.STORAGE_FILE, JSON.stringify(auth, "", 2), function(err, res) {
    if (err) return deferred.reject(err);
    deferred.resolve();
  })
  return deferred.promise;
}

function shutdownSafely(){
  console.log('Authentication successful! Ready to sync.'.green);
  process.stdin.destroy();
  process.exit(0);
};

function moduleErrors() {
  return {
    pathNotFound: 'Credentials path not found. Please input a path to your downloaded JSON credentials and try again.',
    wrongCredentialPath: 'Could not read path to credentials file. Please check your path and try again',
    credentialsNotFound: 'Credentials not found. Please check your path and try again',
    wrongCredentialsFile: 'Path did not include correct credentials. Please check that you downloaded the right JSON credentials.'
  }
}

