const colors = require('colors');
const OAuth2Client = require('googleapis').auth.OAuth2;

const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'), { multiArgs: true });

const defaults = require('./defaults');

module.exports = function authenticate() {
  return getCredentials()
    .then(createAuthClient)
    .catch(err => {
      console.log('Error in authenticate module', err);
    });
};

function getCredentials() {
  return fs
    .readFileAsync(defaults.STORAGE_FILE)
    .then(JSON.parse)
    .catch(SyntaxError, e => {
      console.log('Could not parse credentials'.red);
    })
    .error(e => {
      console.log(
        'Could not read path to credentials file. Please check your path and try again'
          .red
      );
      throw err;
    });
}

function createAuthClient(credentials) {
  const auth = new OAuth2Client(
    credentials.client_id,
    credentials.client_secret,
    credentials.redirect_uri
  );

  // refreshAccessToken requires refresh_token to be set
  auth.credentials.refresh_token = credentials.refresh_token;
  return new Promise((resolve, reject) => {
    auth.refreshAccessToken((err, tokens) => {
      if (err) return reject(err);
      auth.setCredentials(tokens);
      resolve(auth);
    });
  });
}
