var express = require("express");
var secured = require("../middleware/secured");
var router = express.Router();

/* GET user profile.  */
router.get("/", secured(), function (req, res, next) {
  const { _raw, _json, user_metadata, ...userProfile } = req.user;
  console.log("json, ", _json);
  res.send(userProfile);
});

module.exports = router;
