module.exports = {
  DEFAULT_SUBDIR: 'gapps_src',
  DEFAULT_DEPLOYMENT_SUBDIR: 'gapps_deployments',
  STORAGE_FILE: getUserHome() + '/.gaps',
  CONFIG_NAME: 'config.json',
  WEBSERVER_PORT: 2386,
  DEFAULT_DEPLOYMENT: 'dev'
};

function getUserHome() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}
