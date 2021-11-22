const express = require("express");
const router = express.Router();
const debug = require("debug")("ROUTES:landing");
const config = require("config");

router.get("/test", (req, res) => {
  if (config.util.getEnv("NODE_ENV").startsWith("dev")) debug("test test");
  res.send("test 123");
});

module.exports = router;
