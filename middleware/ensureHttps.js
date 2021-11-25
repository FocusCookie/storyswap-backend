require("dotenv").config();
var redirect = require("debug")("APP:REDIRECT");
const config = require("config");

module.exports = (req, res, next) => {
  if (req.secure || req.headers["x-forwarded-proto"] === "https") {
    next();
  }

  redirect(`${req.url}`);
  res.redirect(`https://${req.hostname}:${config.server.httpsPort}${req.url}`); // express 4.x
};
