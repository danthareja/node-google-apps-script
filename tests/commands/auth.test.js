const fs = require("fs");
const { promisify } = require("util");
const unlinkAsync = promisify(fs.unlink);

jest.mock("../../lib/defaults");
jest.mock("../../lib/miniOAuthServer");

jest.mock("googleapis");

const fakeClientSecretPath = "/tmp/.fakeClientSecret";
const defaults = require("../../lib/defaults");

const removeFile = () => unlinkAsync(defaults.STORAGE_FILE).catch(() => {});
const writeFakeFile = () => fs.writeFileSync(defaults.STORAGE_FILE, "f4k3");

let spiedConsole = jest.spyOn(console, "log").mockImplementation(() => {});

const cleanUp = () => {
  jest.resetAllMocks();
  removeFile();
};

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


afterEach(cleanUp);

test("should resolve the promise when a file already exists", async () => {
  writeFakeFile();

  const auth = await require("../../lib/commands/auth")();

  expect(auth).toBeUndefined();
  expect(spiedConsole.mock.calls[0][0]).toMatchSnapshot();
});

test("should reject the promise when a previous file does not exists and a credential path is not provided", async () => {
  try {
    await require("../../lib/commands/auth")();
  } catch (e) {
    expect(e).toMatchSnapshot();
  }
});

test("should start a authentication flow and print the oauth url when a clientSecret is provided", async () => {
  fs.writeFileSync(fakeClientSecretPath, JSON.stringify(clientSecret), "utf-8");

  const auth = require("../../lib/commands/auth");
  await auth(fakeClientSecretPath);

  expect(spiedConsole.mock.calls[0][0]).toMatchSnapshot();
  expect(spiedConsole.mock.calls[0][1]).toContain("https://");

  const obtainedCredentials = JSON.parse(fs.readFileSync(defaults.STORAGE_FILE));
  expect(obtainedCredentials.refresh_token).toEqual("woot_successfully_obtained_refresh_token");
});

test("should complain if credentials are not in the OAuth 2.0 format", async done => {
  const wrongFormatSecret = {
    client_id: "424242424242-f4k3h4ck15h.apps.googleusercontent.com",
    project_id: "project-id-424242424242"
  };
  fs.writeFileSync(
    fakeClientSecretPath,
    JSON.stringify(wrongFormatSecret),
    "utf-8"
  );

  try {
    await require("../../lib/commands/auth")(fakeClientSecretPath);
  } catch (e) {
    expect(e).toMatchSnapshot();
    done();
  }
});
