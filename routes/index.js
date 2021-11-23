var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.send({ title: "Auth 0 Webapp sample Nodejs", req: req.body });
});

module.exports = router;
