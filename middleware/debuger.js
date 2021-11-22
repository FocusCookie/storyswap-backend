var http = require("debug")("APP:HTTP");
var https = require("debug")("APP:HTTPS");
require("dotenv").config();
const NODE_ENV = process.env.NODE_ENV;

const requests = (req, res, next) => {
  const httpsReq = req.secure || req.headers["x-forwarded-proto"] === "https";
  if (NODE_ENV.startsWith("dev")) {
    if (httpsReq) {
      https(`${req.method} ${req.url}`);
    } else {
      http(`${req.method} ${req.url}`);
    }
  }
  next();
};

module.exports = {
  requests,
};
