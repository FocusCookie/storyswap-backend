const express = require("express");
const router = express.Router();
const controller = require("../controller/offers");

router.get("/", async (req, res) => {
  try {
    const offers = await controller.get({ state: "pending" });
    res.send(offers);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
