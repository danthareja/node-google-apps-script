const url = require('url');
const http = require('http');
const Promise = require('bluebird');

const AUTH_PAGE = `
<!DOCTYPE "html">
<html>
  <head>
    <title>Successfully Authenticated</title>
  </head>
  <body>
    You've been authenticated with Google Drive! You may close this page.
  </body>
</html>
`;

module.exports = function createOAuthServer(port) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const { query } = url.parse(req.url, true);

      if (!query.code) {
        return reject('No code in request; did you access this url manually?');
      }

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(AUTH_PAGE);
      server.close();

      return resolve(query.code);
    });

    server.listen(port);
  });
};
