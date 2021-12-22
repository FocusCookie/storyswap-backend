require("dotenv").config();
const config = require("config");
const express = require("express");
const router = express.Router();
const debug = require("debug")("ROUTES:USER-PROXY");

var ManagementClient = require("auth0").ManagementClient;
var auth0 = new ManagementClient({
  domain: config.auth0.domain,
  clientId: config.auth0.management.clientId,
  clientSecret: config.auth0.management.clientSecret,
  scope:
    "read:users update:users read:users_app_metadata update:users_app_metadata delete:users_app_metadata create:users_app_metadata",
});

router.get("/metadata", async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const user = await auth0.getUser({ id: userId });
    debug("%s", user.user_metadata);
    res.send(user.user_metadata);
  } catch (error) {
    debug("%s", error);
    next(error);
  }
});

router.patch("/metadata", async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const metadata = req.body;
    const updatedUser = await auth0.updateUserMetadata(
      { id: userId },
      metadata
    );
    debug("%s", updatedUser);
    res.send(updatedUser);
  } catch (error) {
    debug("%s", error);
    next(error);
  }
});

module.exports = router;
