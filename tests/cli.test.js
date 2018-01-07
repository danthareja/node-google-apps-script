const fs = require("fs");
const { promisify } = require("util");
const { exec } = require('child_process');
const unlinkAsync = promisify(fs.unlink);

const fakeClientSecretPath = "/tmp/.fakeClientSecret";
const clientSecret = {
    installed: {
      client_id: "424242424242-f4k3h4ck15h.apps.googleusercontent.com",
      project_id: "project-id-424242424242",
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://accounts.google.com/o/oauth2/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_secret: "client_secret_fake",
      redirect_uris: ["urn:ietf:wg:oauth:2.0:oob", "http://localhost"]
    }
  };
const execOptions = {
  env: Object.assign({}, process.env, {
    STORAGE_FILE: '/tmp/storage-file-gapps.json'
  })
};
  

describe('auth', () => {
    beforeEach(() => {
        unlinkAsync(fakeClientSecretPath).catch(() => {});
        fs.writeFileSync(fakeClientSecretPath, JSON.stringify(clientSecret), "utf-8");
    });

  test('should exit non zero if not provided with `path/to/client/secret.json`', done => {
    exec('node "./bin/gapps" auth', execOptions, (err, stdout, stderr) => {
      expect(err).toMatchSnapshot();
      done();
    });
  });

  test('should work when provided with `path/to/client/secret.json`', done => {
    exec(`node "./bin/gapps" auth ${fakeClientSecretPath}`, execOptions, (err, stdout, stderr) => {
      expect(err).toBeNull();
      done();
    });
  });
});
