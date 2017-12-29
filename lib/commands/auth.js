const colors = require('colors');
const readline = require('readline');
const OAuth2Client = require('googleapis').auth.OAuth2;

const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'), { multiArgs: true });

const defaults = require('../defaults');

const GOOGLE_AUTH_SCOPE = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.scripts'
];

/**
 * Tries to find the storage file. If found, tells the users to remove it, otherwiser runs the
 * authentication flow using the provided path the to the clientSecret path
 * @param {String} clientSecretPath
 * @param {Boolean} withWebServer
 * @returns {Promise}
 */
module.exports = function auth(clientSecretPath, withWebServer = true) {
  return fs
    .lstatAsync(defaults.STORAGE_FILE)
    .then(() => {
      console.log(
        defaults.STORAGE_FILE +
          ' already exists. Remove it to re-authenticate node-google-apps-script'
      );
      return Promise.resolve();
    })
    .catch(err => {
      if (!clientSecretPath) {
        throw defaults.STORAGE_FILE +
          ' does not exist yet. Specify a credential file with `--auth ~/Downloads/client_secret_abcd.json`';
      }
      return performAuthenticationFlow(clientSecretPath, withWebServer);
    });
};

/**
 * Performs the authentication flow by reading the .json file
 * and using it's content to authenticate with Google. When
 * done, clean ups the stdin.
 * @param {String} clientSecretPath
 * @param {Boolean} withWebServer
 * @return {Promise}
 */
function performAuthenticationFlow(clientSecretPath, withWebServer) {
  return getCredentialsFromFile(clientSecretPath)
    .then(credentials => authenticateWithGoogle(credentials, withWebServer))
    .then(saveAuthenticationConfig)
    .then(cleanUp)
    .then(() => {
      console.log('Successfully Authenticated with Google Drive!'.green);
    })
    .catch(err => {
      console.log('Error running auth command'.underline.red);
      console.log(err.red);
      throw err;
    });
}

/**
 * The parsed credentials
 * @typedef {Object} Credentials
 * @property {String} client_id
 * @property {String} client_secret
 * @property {String} redirect_uri
 * @property {String} [refresh_token]
 */
/**
 * Reads the content of the credentials file and returns a object
 * with the important fields
 * @param {String} clientSecretPath
 * @returns {Promise<Credentials>}
 */
function getCredentialsFromFile(clientSecretPath) {
  return fs
    .readFileAsync(clientSecretPath)
    .then(JSON.parse)
    .then(credentials => {
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
    .catch(SyntaxError, err => {
      console.log('Invalid file contents'.red);
    })
    .error(err => {
      console.log('Unable to read file'.red);
      throw err;
    });
}

/**
 * Authenticate with Google using the parsed credentials.
 * Uses the OAuth2Client to generate the AuthUrl
 * @param {Credentials} credentials
 * @param {Boolean} withWebServer
 * @returns {Promise}
 */
function authenticateWithGoogle(credentials, withWebServer) {
  return new Promise((resolve, reject) => {
    let redirect_uri = credentials.redirect_uri;
    if (withWebServer) {
      redirect_uri = 'http://localhost:' + defaults.WEBSERVER_PORT;
    }

    const oauth2Client = new OAuth2Client(
      credentials.client_id,
      credentials.client_secret,
      redirect_uri
    );
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline', // Required to receive a refresh token
      approval_prompt: 'force',
      scope: GOOGLE_AUTH_SCOPE
    });

    const getToken = code => {
      oauth2Client.getToken(code, (err, tokens) => {
        if (err) {
          reject(err);
          return;
        }
        credentials.refresh_token = tokens.refresh_token;
        resolve(credentials);
      });
    };

    console.log(
      "\nPlease visit the following url in your browser (you'll only have to do this once):"
        .cyan,
      url.green
    );

    if (withWebServer) {
      require('../miniOAuthServer')(defaults.WEBSERVER_PORT)
        .then(getToken)
        .catch(err => {
          console.log('Something went wrong with the webserver'.red);
          throw err;
        });
    } else {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      rl.question('Copy the provided code and paste it here: ', code => {
        rl.close();

        getToken(code);
      });
    }
  });
}

/**
 * Write the contents to disk
 * @param {Credentials} credentials
 */
function saveAuthenticationConfig(credentials) {
  return fs.writeFileAsync(
    defaults.STORAGE_FILE,
    JSON.stringify(credentials, '', 2)
  );
}

/**
 * Destroys the stdin
 * @todo put inline if only used here
 */
function cleanUp() {
  process.stdin.destroy();
}
