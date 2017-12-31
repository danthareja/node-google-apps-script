// Get the genuine googleapis library:
const googleapis = require.requireActual('googleapis');

// Override the getToken with a mock (we don't want to hit Google's servers in our tests)
googleapis.auth.OAuth2.prototype.getToken = (code, cb) => {
  console.log("googleapis.auth.OAuth2 getToken called with code " + code);
  cb(null, {
    refresh_token: "woot_successfully_obtained_refresh_token"
  });
};

module.exports = googleapis;
