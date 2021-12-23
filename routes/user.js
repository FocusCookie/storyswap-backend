require("dotenv").config();
const config = require("config");
const express = require("express");
const router = express.Router();
const debug = require("debug")("ROUTES:USER-PROXY");
const controller = require("../controller/user");

router.get("/", async (req, res, next) => {
  try {
    const userSub = req.user.sub;
    const profile = await controller.getUserProfile(userSub);

    res.send(profile);
  } catch (error) {
    debug("%s", error);
    next(error);
  }
});

router.get("/metadata", async (req, res, next) => {
  try {
    const userSub = req.user.sub;
    const metadata = await controller.getUserMetadata(userSub);
    res.send(metadata);
  } catch (error) {
    debug("%s", error);
    next(error);
  }
});

router.patch("/metadata", async (req, res, next) => {
  try {
    const userSub = req.user.sub;
    const metadata = req.body;

    const updatedMetadata = await controller.updateUserMetadata(
      userSub,
      metadata
    );

    res.send(updatedMetadata);
  } catch (error) {
    debug("%s", error);
    next(error);
  }
});

router.patch("/", async (req, res, next) => {
  try {
    const userSub = req.user.sub;
    const userPatch = req.body;

    const updatedUser = await controller.updateUser(userSub, userPatch);

    res.send(updatedUser);
  } catch (error) {
    debug("%s", error);
    next(error);
  }
});

//TODO implement /delete /change-password

module.exports = router;
