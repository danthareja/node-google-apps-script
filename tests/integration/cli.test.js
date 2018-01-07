const fs = require('fs');
const { promisify } = require('util');
const { exec, spawn } = require('child_process');
const unlinkAsync = promisify(fs.unlink);

const fakeClientSecretPath = '/tmp/.fakeClientSecret';
const fakeConfigPath = '/tmp/.gapps-config';
const clientSecret = {
  installed: {
    client_id: '424242424242-f4k3h4ck15h.apps.googleusercontent.com',
    project_id: 'project-id-424242424242',
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://accounts.google.com/o/oauth2/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_secret: 'client_secret_fake',
    redirect_uris: ['urn:ietf:wg:oauth:2.0:oob', 'http://localhost']
  }
};
const execOptions = {
  env: Object.assign({}, process.env, {
    STORAGE_FILE: '/tmp/storage-file-gapps.json',
    CONFIG_NAME: fakeConfigPath
  })
};
const deleteFile = (path) => unlinkAsync(path).catch(() => {});
const deleteFakeClientSecret = () => deleteFile(fakeClientSecretPath);

describe('integration', () => {
  describe('auth', () => {
    beforeEach(async (done) => {
      await deleteFakeClientSecret();
      await fs.writeFile(
        fakeClientSecretPath,
        JSON.stringify(clientSecret),
        'utf-8'
      );
      await fs.writeFile(
        fakeConfigPath,
        JSON.stringify({ src: '', fileId: '' }),
        'utf-8'
      );
      done();
    });

    test('should exit non zero if not provided with `path/to/client/secret.json`', (done) => {
      exec('node "./bin/gapps" auth', execOptions, (err, stdout, stderr) => {
        expect(err).toMatchSnapshot();
        done();
      });
    });

    test('should work when provided with `path/to/client/secret.json`', (done) => {
      const run = spawn(
        'node',
        ['./bin/gapps', 'auth', fakeClientSecretPath],
        execOptions
      );

      run.stdout.on('data', (data) => {
        expect(data.toString()).toMatchSnapshot();
        run.kill();
        done();
      });
    });

    test('should support running without a local webserver', (done) => {
      const run = spawn(
        'node',
        ['./bin/gapps', 'auth', fakeClientSecretPath, '--no-launch-browser'],
        execOptions
      );

      run.stdout.on('data', (data) => {
        expect(data.toString()).toMatchSnapshot();
        run.kill();
        done();
      });
    });
  });

  describe('oauth-callback-url', () => {
    test('should inform when no project key is present in the config file', (done) => {
      // todo: Change to return non-zero
      exec(
        'node "./bin/gapps" oauth-callback-url',
        execOptions,
        (err, stdout, stderr) => {
          expect(err).toMatchSnapshot();
          expect(stdout).toMatchSnapshot();
          expect(stderr).toMatchSnapshot();
          done();
        }
      );
    });
  });
});
