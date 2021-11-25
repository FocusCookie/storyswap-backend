const express = require("express");
const router = express.Router();
const debug = require("debug")("DEV:TEST-JS");

router.get("/", (req, res) => {
  debug(req.user);
  res.send("test 123");
});

module.exports = router;
