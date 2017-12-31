const fs = require("fs");
const path = require("path");
const process = require("process");
const { promisify } = require("util");

const unlinkAsync = promisify(fs.unlink);
const rimraf = promisify(require('rimraf'));

const fakeClientSecretPath = "/tmp/.fakeClientSecret";
const defaults = require("../../lib/defaults");

// TODO export in a test helpers file (folder?)
let spiedConsole = jest.spyOn(console, "log").mockImplementation(() => {});

const workingDirectory = "/tmp/gapps-init-test";

const setup = () => {
  fs.mkdirSync(workingDirectory);
  process.chdir(workingDirectory);
}

const teardown = async () => {
  await rimraf(workingDirectory);

  jest.resetAllMocks();
};

beforeEach(setup);
afterEach(teardown);

test("should check the provided fileId is not a project key", async () => {
  const init = require("../../lib/commands/init");
  await init("MFQVRDQbuEJFkzP0Kafn0fVLQHf-4KJyd", {});
  expect(spiedConsole.mock.calls[0][0]).toMatchSnapshot();
});

test("should fail if a config file already exists", async () => {
  const init = require("../../lib/commands/init");

  const configPath = path.join(workingDirectory, defaults.CONFIG_NAME);
  console.log(configPath);

  // TODO if the JSON is malformed, we get an "unexpected end of json input"
  fs.writeFileSync(configPath, '{}');

  try {
    await init("1NS2GWZQtgo1rxPuA13fhagxtfs95M3dE_dbtQ3GYAEiXGBzYZreSUhUu", {});
  } catch(e) {
    expect(e).toMatchSnapshot();
  }
})

test("should clone the project", async () => {
  const init = require("../../lib/commands/init");

  // Test project: https://script.google.com/macros/d/1NS2GWZQtgo1rxPuA13fhagxtfs95M3dE_dbtQ3GYAEiXGBzYZreSUhUu/edit?usp=drive_web&splash=yes
  const fileId = '1NS2GWZQtgo1rxPuA13fhagxtfs95M3dE_dbtQ3GYAEiXGBzYZreSUhUu';

  await init(fileId, {});

  const writtenConfigFile = fs.readFileSync(path.join(workingDirectory, 'gapps.config.json'));
  const parsedConfig = JSON.parse(writtenConfigFile);

  // Make sure a config file was created with the correct file id:
  expect(parsedConfig.fileId).toEqual(fileId);

  // Grab the file in the src folder to make sure it was correctly downloaded:
  const codeFile = fs.readFileSync(path.join(workingDirectory, "src/Code.js")).toString();
  expect(codeFile).toMatchSnapshot();
});
