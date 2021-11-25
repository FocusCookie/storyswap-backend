const debug = require("debug")("ERROR");

module.exports = function (err, req, res, next) {
  if (!err) {
    next();
  } else {
    debug("%s", err);
    res.statusMessage = err.message || "something went wrong";
    res.status(err.status || 500).end();
  }
};
