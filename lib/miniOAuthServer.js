var url = require('url');
var http = require('http');
var Promise = require('bluebird');

module.exports = function createOAuthServer(port) {
  return new Promise(function(resolve, reject) {

    var server = http.createServer(function(req, res) {
      var query = url.parse(req.url, true).query;
      if (!query.code) {
        reject('No code in request; did you access this url manually?');
      }
      resolve(query.code);

      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write('<!DOCTYPE "html">');
      res.write('<html>');
      res.write('<head>');
      res.write('<title>Successfully Authenticated</title>');
      res.write('</head>');
      res.write('<body>');
      res.write('You\'ve been authenticated with Google Drive! You may close this page.');
      res.write('</body>');
      res.write('</html>');
      server.close();
    });

    server.listen(port);
  });
};
