const fs = require('fs');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);
jest.mock('../../lib/defaults');

const defaults = require('../../lib/defaults');

const removeFile = () => unlinkAsync(defaults.STORAGE_FILE).catch(() => { });
const writeFakeFile = () => fs.writeFileSync(defaults.STORAGE_FILE, 'f4k3');

const spyOnConsoleLog = () => jest.spyOn(console, 'log').mockImplementation(() => {});
const restoreConsole = () => jest.restoreAllMocks();

const clientSecret = {
    installed: {
        client_id: "424242424242-f4k3h4ck15h.apps.googleusercontent.com",
        project_id: "project-id-424242424242",
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://accounts.google.com/o/oauth2/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_secret: "client_secret_fake",
        redirect_uris: [
            "urn:ietf:wg:oauth:2.0:oob",
            "http://localhost"
        ]
    }
};

test('should resolve the promise when a file already exists', async () => {
    writeFakeFile();
    const spied = spyOnConsoleLog();

    const auth = await require('../../lib/commands/auth')();
    expect(auth).toBeUndefined();
    expect(spied.mock.calls[0][0]).toMatchSnapshot();
    
    restoreConsole();
    removeFile();
});

test('should reject the promise when a previous file does not exists and a credential path is not provided', async () => {
    await removeFile();

    try {
        await require('../../lib/commands/auth')();
    } catch (e) {
        expect(e).toMatchSnapshot();
    }
});

test('should start a authentication flow and print the oauth url when a clientSecret is provided', async (done) => {
    await removeFile();
    const spied = spyOnConsoleLog();

    const fakeClientSecretPath = '/tmp/.fakeClientSecret';
    fs.writeFileSync(fakeClientSecretPath, JSON.stringify(clientSecret), 'utf-8');

    require('../../lib/commands/auth')(fakeClientSecretPath);


    // TODO: Find a better way
    // Now we are using setTimeout just to have enought time for the async code to run
    setTimeout(
        () => {
            expect(spied.mock.calls[0][0]).toMatchSnapshot();
            expect(spied.mock.calls[0][1]).toContain('https://');
            expect(spied).toHaveBeenCalled();
            spied.mockRestore();
            done();
        },
        1000
    );
});