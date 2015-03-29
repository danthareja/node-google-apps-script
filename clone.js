var fs = require('fs');
var path = require('path');
var config = require('./config');

module.exports = function(project) {
  var filepath = path.join(config.CLONE_PATH_BASE, project.title);
  fs.mkdirSync(filepath);
  project.files.forEach(function(file) {
    var filename = file.name + getFileExtension(file);
    fs.writeFile(path.join(filepath, filename), file.source, function(err) {
      if (err) throw err;
    });
  })
};

function getFileExtension(file) {
  if (file.type === 'server_js') return '.js';
  if (file.type === 'html') return '.html';
  throw new Error('Unsupported file type found');
}