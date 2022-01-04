const express = require("express");
const router = express.Router();
const debug = require("debug")("ROUTES:RESERVATIONS");
const controller = require("../controller/reservations");
const authorization = require("../controller/authorization");
const auth = require("../middleware/auth");
const prettyUser = require("../middleware/prettyUser.js");

router.get("/", auth, prettyUser, async (req, res, next) => {
  try {
    const user = req.user;
    const reservations = await controller.getByUser(user);

    const onlyPendingReservations = reservations.filter(
      (reservation) => reservation.state === "reserved"
    );

    res.send(onlyPendingReservations);
  } catch (error) {
    debug("%s", error);
    next(error);
  }
});

router.post("/:id/pickedup", auth, prettyUser, async (req, res, next) => {
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

module.exports = router;
