module.exports = {
  DEFAULT_SUBDIR: 'gapps_src',
  DEFAULT_DEPLOYMENT_SUBDIR: 'gapps_targets',
  PACKAGES_PATH: 'gapps_packages',
  PACKAGES_ROOT: 'https://storage.googleapis.com/gaps-packages/lab',
  STORAGE_FILE: getUserHome() + '/.gapps',
  CONFIG_NAME: 'config.json',
  WEBSERVER_PORT: 2386,
  DEFAULT_DEPLOYMENT: 'dev'
};

function getUserHome() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}
