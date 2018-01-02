const url = require('url');
const http = require('http');
const Promise = require('bluebird');

module.exports = async function createOAuthServerMock(port) {
  console.log("createOAuthServerMock with port " + port);
  return Promise.resolve("oauth_code_acquired_through_authentication_flow");
};
