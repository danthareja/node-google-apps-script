var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var dir = require('node-dir');
var path = require('path');
var config = require('../config');
var _ = require('lodash');

// Readies manifest for export by updating with all local file changes
var build = function(manifest) {
  return new Promise(function(resolve, reject) {

    var filesOnDisk = [];

    // Only iterate through supported .js and .html files in dir
    dir.readFiles(manifest.path, { match: /.js$|.html$/ },
      // Invoke this callback on each file
      function(err, content, filename, next) {
        if (err) return reject(err);

        // Parse file's absolute path and add its content to result object
        file = path.parse(filename);
        file.content = content;

        filesOnDisk.push(file);

        // Continue to next file
        next();
      },
      // finished callback. Write updated manifest back to file
      function(err, files) {
        if (err) return reject(err);

        manifest.files = _.filter(manifest.files, function(mFile) {
          // for each manifest file, if it has an equivalent on disk, keep it
          // otherwise trash it
          return hasFileOnDisk(filesOnDisk, mFile);
        });

        filesOnDisk.forEach(function(file) {
          // Add new file or update existing record
          var manifestFile = getFileInManifest(manifest, file);
          if (!manifestFile) {
            addFileToManifest(manifest, file);
          } else {
            updateFileSource(manifestFile, file);
          }
        });

        setManifest(manifest)
          .then(resolve)
          .catch(reject);

      });
  });
};

function addFileToManifest(manifest, file) {
  manifest.files.push({
    // Google Apps Script API will automatically create a new entry for a file with no id
    name: file.name,
    type: getFileType(file),
    source: file.content
  });
}

function updateFileSource(existingFile, newFile) {
  existingFile.source = newFile.content;
}

function hasFileOnDisk(filesOnDisk, file) {
  for (var i = 0; i < filesOnDisk.length; i++) {
    var sameName = file.name === filesOnDisk[i].name;
    var sameType = file.type === getFileType(filesOnDisk[i]);
    if (sameName && sameType) return true;
  }
  return false;
}

function getFileInManifest(manifest, file) {
  for (var i = 0; i < manifest.files.length; i++) {
    var sameName = manifest.files[i].name === file.name;
    var sameType = manifest.files[i].type === getFileType(file);
    if (sameName && sameType) return manifest.files[i];
  }
  return null;
}

function getFileType(file) {
  if (file.ext === '.js') return 'server_js';
  if (file.ext === '.html') return 'html';
  throw new Error('Unsupported file type found. Google Apps Script only allows .js and .html');
}


function getManifest(subdir) {
  var manifestPath = path.join(subdir, config.MANIFEST_NAME);
  return fs.readFileAsync(manifestPath)
    .then(JSON.parse)
    .then(function(manifest) {

      if (!manifest.files) {
        throw errors.wrongManifest;
      }

      return manifest;
    })
    .catch(SyntaxError, function(e) {
      console.log('Error parsing manifest'.red);
      throw e;
    })
    .error(function(e) {
      console.log('Manifest does not exist'.red);
      throw e;
    });
}

function setManifest(manifest) {
  var manifestPath = path.join(manifest.path, config.MANIFEST_NAME);
  return fs.writeFileAsync(manifestPath, JSON.stringify(manifest, "", 2))
    .then(function() {
      return manifest;
    });
}

module.exports.build = build;
module.exports.get = getManifest;
module.exports.set = setManifest;
