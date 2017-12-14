const colors = require('colors');
const readline = require('readline');
const OAuth2Client = require('googleapis').auth.OAuth2;

const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));

const defaults = require('../defaults');

const GOOGLE_AUTH_SCOPE = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.scripts'
];

module.exports = function auth(clientSecretPath, withWebserver) {
  return fs.lstatAsync(defaults.STORAGE_FILE)
    .then(() => {
      console.log(defaults.STORAGE_FILE + ' already exists. Remove it to re-authenticate node-google-apps-script');
      return Promise.resolve();
    })
    .catch((err) => {
      if (!clientSecretPath) {
        throw defaults.STORAGE_FILE + ' does not exist yet. Specify a credential file with `--auth ~/Downloads/client_secret_abcd.json`';
      }
      return performAuthenticationFlow(clientSecretPath, withWebserver);
    });
};

function performAuthenticationFlow(clientSecretPath, withWebserver) {
  return getCredentialsFromFile(clientSecretPath)
      .then((credentials) => authenticateWithGoogle(credentials, withWebserver))
      .then(saveAuthenticationConfig)
      .then(cleanUp)
      .then(() => {
        console.log('Successfully Authenticated with Google Drive!'.green);
      })
      .catch((err) => {
        console.log('Error running auth command'.underline.red);
        throw err;
      });
}

function getCredentialsFromFile(clientSecretPath) {
  return fs.readFileAsync(clientSecretPath)
    .then(JSON.parse)
    .then((credentials) => {
      if (!credentials.installed) {
        throw 'Path did not include "OAuth 2.0 client ID" credentials. Please check that you downloaded the right JSON credentials.';
      }
      
      // Add important auth information to persist
      // return credentials
      return {
        client_id: credentials.installed.client_id,
        client_secret: credentials.installed.client_secret,
        redirect_uri: credentials.installed.redirect_uris[0]
      };
    })
    .catch(SyntaxError, (err) => {
      console.log('Invalid file contents'.red);
    })
    .error((err) => {
      console.log('Unable to read file'.red);
      throw err;
    });
}

function authenticateWithGoogle(credentials, withWebserver) {
  return new Promise((resolve, reject) => {

    const redirect_uri = credentials.redirect_uri;
    if (withWebserver) {
      redirect_uri = 'http://localhost:' + defaults.WEBSERVER_PORT;
    }

    const oauth2Client = new OAuth2Client(credentials.client_id, credentials.client_secret, redirect_uri);
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline', // Required to receive a refresh token
      approval_prompt: 'force',
      scope: GOOGLE_AUTH_SCOPE
    });


    const getToken = (code) => {
      oauth2Client.getToken(code, (err, tokens) => {
        if (err) { reject(err); return; }
        credentials.refresh_token = tokens.refresh_token;
        resolve(credentials);
      });
    };

    console.log('\nPlease visit the following url in your browser (you\'ll only have to do this once):'.cyan, url.green);

    if (withWebserver) {

      require('../miniOAuthServer')(defaults.WEBSERVER_PORT)
        .then(getToken)
        .catch((err) => {
          console.log('Something went wrong with the webserver'.red);
          throw err;
        });

    } else {

      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      rl.question('Copy the provided code and paste it here: ', (code) => {
        rl.close();

        getToken(code);

      });
    }
  });
}

function saveAuthenticationConfig(credentials) {
  return fs.writeFileAsync(defaults.STORAGE_FILE, JSON.stringify(credentials, "", 2));
}

function cleanUp() {
  process.stdin.destroy();
}
