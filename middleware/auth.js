const jwt = require("express-jwt");
const jwks = require("jwks-rsa");

module.exports = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: "https://storyswap.eu.auth0.com/.well-known/jwks.json",
  }),
  audience: "https://api.storyswap.app",
  issuer: "https://storyswap.eu.auth0.com/",
  algorithms: ["RS256"],
});
