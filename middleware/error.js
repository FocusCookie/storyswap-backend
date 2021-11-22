const debug = require("debug")("ERROR");

module.exports = function (err, req, res, next) {
  if (!err) {
    next();
  } else {
    debug("%o", err);
    res.status(err.status || 500).send("Opps! " + err.message);
  }
};
