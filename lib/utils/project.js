var errors = require('./errors');

function getProjectById(fileId) {
  var project = {};
  var deferred = Q.defer();
  authenticate().then(function(auth) {
    return Q.all([getProjectTitle(fileId, auth), getProjectFiles(fileId, auth)]);
  })
  .spread(function(title, files) {
    project.title = title;
    project.files = files;
    project.id = fileId;
    deferred.resolve(project);
  })
  return deferred.promise;
}

function getProjectTitle(fileId, auth) {
  var deferred = Q.defer();
  var drive = google.drive({ version: 'v2', auth: auth });
  drive.files.get({ fileId: fileId }, function(err, res) {
    if (err) return deferred.reject('Error getting project');
    deferred.resolve(res.title);
  });
  return deferred.promise;
}

function getProjectFiles(fileId, auth) {
  var deferred = Q.defer();
  var options = {
    url: DOWNLOAD_URL + fileId,
    qs :{ 'access_token' : auth.credentials.access_token }
  };
  request.get(options, function(err, res, body) {
    if (err) return deferred.reject(err);
    try {
      var project = JSON.parse(body);
    } catch (e) {
      return deferred.reject(e);
    }
    if (!project.files) return deferred.reject(errors.noFiles);
    deferred.resolve(project.files);
  });
  return deferred.promise;
}

module.exports.getProjectById = getProjectById;
