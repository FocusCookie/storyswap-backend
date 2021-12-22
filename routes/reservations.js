const express = require("express");
const router = express.Router();
const debug = require("debug")("ROUTES:RESERVATIONS");
const controller = require("../controller/reservations");
const authorization = require("../controller/authorization");

router.get("/", async (req, res, next) => {
  try {
    const user = req.user;
    const reservations = await controller.getByUser(user);
    //TODO filter out the delted and pickedup
    res.send(reservations);
  } catch (error) {
    debug("%s", errror);
    next(error);
  }
});

router.post("/:id/pickedup", async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = req.user;
    const reservation = await controller.getById(id);

    if (!authorization.reservations.userIsCollector(user, reservation))
      throw { status: 403, message: "not authorized" };

    const updatedReservation = await controller.update(id, {
      state: "pickedup",
    });
    res.send(updatedReservation);
  } catch (error) {
    debug("%s", error);
    next(error);
  }
});

// post /:id/pickedup -> update as pickedup

module.exports = router;
