const { OAuth2Client } = require("google-auth-library");
const { SOCIAL } = require("../../../config");

module.exports = {
  google: new OAuth2Client(
    SOCIAL.google.clientID,
    SOCIAL.google.clientSecret,
    SOCIAL.google.redirectUrl
  ),
};
