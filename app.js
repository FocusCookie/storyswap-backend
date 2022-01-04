const express = require("express");
const http = require("http");
const app = express();
require("dotenv").config();
const config = require("config");
const cron = require("node-cron");
const Reservation = require("./models/reservation");
const offersController = require("./controller/offers");
const reservationController = require("./controller/reservations");

require("./init/mongodb");

const startup = require("debug")("APP");

const isbnApiKey = config.isbndb.apiKey;
if (!isbnApiKey) throw new Error("ISBNDB API KEY not setup in env vars");

// ROUTES
require("./init/routes")(app);

//* All expired reservations will be set to delete and removed from the offer, everyday at 0:01 am
cron.schedule("1 0 * * *", async () => {
  try {
    let today = new Date();
    today.setHours(0, 0, 1, 0);

    const allExpiredReservations = await Reservation.find({
      $and: [{ until: { $lt: today } }, { state: "reserved" }],
    });

    debug("check for expired reservations");

    if (allExpiredReservations.length > 0) {
      debug("found ", allExpiredReservations.length, " expired reservations");
      const setAllExpiredReservationsToExpiredPromieses = [];
      const removeAllReservationsFromOffersPromises = [];

      allExpiredReservations.forEach((reservation) => {
        setAllExpiredReservationsToExpiredPromieses.push(
          reservationController.update(reservation._id.toString(), {
            state: "expired",
          })
        );

        removeAllReservationsFromOffersPromises.push(
          offersController.update(id, {
            reservation: null,
            state: "pending",
          })
        );
      });

      await Promise.all(setAllExpiredReservationsToExpiredPromieses);
      await Promise.all(removeAllReservationsFromOffersPromises);
    }
  } catch (error) {
    debug("cronjob error: ", error);
  }
});

http
  .createServer(app)
  .listen(config.server.httpPort, config.server.host, () => {
    startup(
      `Example app listening at http://${config.server.host}:${config.server.httpPort}`
    );
  });
