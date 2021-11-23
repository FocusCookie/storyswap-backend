const debug = require("debug")("ERROR");

module.exports = function (err, req, res, next) {
  if (!err) {
    next();
  } else {
    debug("%s", err);
    res.status(err.status || 500).send(err.message);
  }
};
