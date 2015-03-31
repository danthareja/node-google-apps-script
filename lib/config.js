module.exports = {
  CLONE_DESTINATION_BASE: null, // stores in cwd by default
  STORAGE_FILE: getUserHome() + '/.GASync',
  MANIFEST_NAME: 'manifest.json'
};

function getUserHome() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}