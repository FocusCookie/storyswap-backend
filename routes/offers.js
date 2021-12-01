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

router.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const offer = await controller.getById(id);
    res.send(offer);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    console.log(req.user);
    const provider = {
      sub: req.user.sub,
      nickname: req.user.nickname,
      picture: req.user.picture,
    };
    const offer = {
      provider: provider,
      book: req.body.book,
      zip: req.body.zip,
      city: req.body.city,
    };

    const createdOffer = await controller.create(offer);
    res.send(createdOffer);
  } catch (error) {
    next(error);
  }
});

router.post("/:id/reserve", async (req, res, next) => {
  try {
    const id = req.params.id;
    const collector = {
      sub: req.user.sub,
      nickname: req.user.nickname,
      picture: req.user.picture,
    };
    const update = {
      collector: collector,
      state: "reserved",
    };

    //TODO: Implement the reservation - create reservation with offer id
    const offer = await controller.getById(id);

    if (offer.provider.sub === collector.sub)
      next(new Error("You cant reserve you own offers."));

    const updatededOffer = await controller.update(id, update);
    res.send(updatededOffer);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
