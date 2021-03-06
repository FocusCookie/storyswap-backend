const express = require("express");
const router = express.Router();
const debug = require("debug")("ROUTES:OFFERS");
const offersController = require("../controller/offers");
const reservationController = require("../controller/reservations");
const { firstDateIsPastDayComparedToSecond } = require("../helpers/util");
const authorization = require("../controller/authorization");
const auth = require("../middleware/auth");
const prettyUser = require("../middleware/prettyUser.js");

router.post("/filter", auth, prettyUser, async (req, res, next) => {
  try {
    const lastFetchedOfferId = req.body.lastFetchedOfferId || null;
    const reqFilter = req.body.filter || null;

    let filter = {
      state: "pending",
    };

    if (reqFilter) {
      filter = { ...filter, ...reqFilter };
    }

    if (reqFilter && reqFilter.zip) filter.zip = parseInt(filter.zip);
    if (reqFilter && reqFilter.city) filter.city = filter.city.toLowerCase();

    const offers = await offersController.get(filter, lastFetchedOfferId);

    const offersNotFromUser = offers.filter(
      (offer) => offer.provider.sub !== req.user.sub
    );

    res.send(offersNotFromUser);
  } catch (error) {
    next(error);
  }
});

router.get("/my", auth, prettyUser, async (req, res, next) => {
  try {
    const user = req.user;
    const offers = await offersController.getByUser(user);

    const withoutPickedupOffers = offers.filter(
      (offer) => offer.state !== "pickedup"
    );

    res.send(withoutPickedupOffers);
  } catch (error) {
    debug("%s", error);
    next(error);
  }
});

router.get("/:id", auth, prettyUser, async (req, res, next) => {
  try {
    const id = req.params.id;
    const offer = await offersController.getById(id);

    if (!offer) throw { status: 400, message: `No offer found with id: ${id}` };
    res.send(offer);
  } catch (error) {
    next(error);
  }
});

router.post("/", auth, prettyUser, async (req, res, next) => {
  try {
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

    const createdOffer = await offersController.create(offer);
    res.send(createdOffer);
  } catch (error) {
    next(error);
  }
});

router.post("/:id/reserve", auth, prettyUser, async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = req.user;
    const reservation = {
      collector: user,
      offer: id,
      until: req.body.until,
    };

    const offer = await offersController.getById(id);

    if (!offer) throw { status: 400, message: "no offer found with id: " + id };
    if (offer.state === "reserved" || offer.reservation)
      throw { status: 400, message: "offer is already reserved" };

    if (authorization.offers.userIsProvider(user, offer))
      throw {
        status: 400,
        message: "you can not reserve your own offer",
      };

    const createdReservation = await reservationController.create(reservation);
    await offersController.update(id, {
      reservation: createdReservation._id.toString(),
      state: "reserved",
    });

    res.send(createdReservation);
  } catch (error) {
    next(error);
  }
});

router.post("/:id/unreserve", auth, prettyUser, async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = req.user;

    const offer = await offersController.getById(id);

    if (!offer) throw { status: 400, message: "no offer found with id: " + id };
    if (!offer.reservation || offer.state === "pending")
      throw { status: 400, message: "offer is not reserved" };

    const reservation = await reservationController.getById(
      offer.reservation.toString()
    );

    if (!authorization.reservations.userIsCollector(user, reservation)) {
      throw {
        status: 403,
        message: "not authorized to change a reservation of another user",
      };
    } else {
      const today = new Date();

      debug("%s", { today: today, until: reservation.until });

      if (firstDateIsPastDayComparedToSecond(reservation.until, today)) {
        await offersController.update(id, {
          reservation: null,
          state: "pending",
        });
        await reservationController.update(reservation._id.toString(), {
          state: "expired",
        });

        throw { status: 400, message: "reservation is expired" };
      }

      await offersController.update(id, {
        reservation: null,
        state: "pending",
      });

      await reservationController.update(reservation._id.toString(), {
        state: "deleted",
      });

      const updatedOffer = await offersController.getById(id);

      res.send(updatedOffer);
    }
  } catch (error) {
    next(error);
  }
});

router.post("/:id/pickedup", auth, prettyUser, async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = req.user;

    const offer = await offersController.getById(id);

    if (offer.state === "pickedup")
      throw { status: 400, message: "offer is already pickedup" };

    if (!offer) throw { status: 400, message: "No offer found with id: ", id };
    if (offer.provider.sub !== user.sub) {
      throw {
        status: 403,
        message: "not authorized to change a offer of another user",
      };
    }
    if (!offer.reservation || offer.state === "pending")
      throw {
        status: 400,
        message: "offer is not reserved, so it can't be pickedup",
      };

    await offersController.update(id, {
      state: "pickedup",
    });

    const updatedOffer = await offersController.getById(id);
    res.send(updatedOffer);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", auth, prettyUser, async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = req.user;

    const offer = await offersController.getById(id);

    if (offer.provider.sub !== user.sub) {
      throw {
        status: 403,
        message: "not authorized todelete an offer of another user",
      };
    }

    if (offer.reservation) {
      await reservationController.delete(offer.reservation._id);
    }

    await offersController.update(id, { state: "deleted" });

    res.send(`Offer with ID: ${offer._id} successfully deleted.`);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
