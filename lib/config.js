module.exports = {
  CLONE_DESTINATION_BASE: null, // stores in cwd by default
  STORAGE_FILE: getUserHome() + '/.gaps',
  MANIFEST_NAME: '.manifest.json',
  WEBSERVER_PORT: 2386
};

function getUserHome() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}
