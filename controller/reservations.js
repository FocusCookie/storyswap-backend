const debug = require("debug")("CONTROLLER:RESERVATIONS");
const Reservation = require("../models/reservation");
const Offer = require("../models/offer");
const OfferController = require("../controller/offers");
const { isValidDate } = require("../helpers/util");
const mongoose = require("mongoose");

const ITEMS_PER_PAGE = 10;

module.exports.create = async function (reservation) {
  try {
    if (
      !reservation ||
      typeof reservation !== "object" ||
      Array.isArray(reservation)
    )
      throw new Error("invalid reservation");

    const newReservation = new Reservation(reservation);

    const validatedreservation = newReservation.validateSync();
    const validationErrors = validatedreservation
      ? Object.values(validatedreservation.errors).map((err) => err.message)
      : null;

    if (validationErrors) {
      throw new Error(`invalid reservation - ${validationErrors.join(" - ")}`);
    }

    const createdReservation = await newReservation.save();

    return createdReservation;
  } catch (error) {
    debug("%s", error);
    throw new Error(error);
  }
};

module.exports.update = async function (id, update) {
  try {
    if (!id || typeof id !== "string") throw new Error("invalid id");

    const idIsValid = mongoose.Types.ObjectId.isValid(id);
    if (!idIsValid) throw new Error("invalid id");

    if (!update || typeof update !== "object" || Array.isArray(update))
      throw new Error("invalid update");

    const reservation = await Reservation.findOne({ _id: id });
    if (!reservation) throw new Error("No reservation found with id: ", id);

    const { until, state } = update;

    if (state && typeof state !== "string")
      throw new Error("invalid state update");
    if (
      state &&
      !(
        state === "pending" ||
        state === "deleted" ||
        state === "pickedup" ||
        state === "expired"
      )
    )
      throw new Error("invalid state update");

    if (until && !isValidDate(until))
      throw new Error("invalid until date update");

    let validUpdateProps = {};
    if (until) validUpdateProps.until = until;
    if (state) validUpdateProps.state = state;

    if (Object.values(validUpdateProps).length === 0)
      throw new Error("invalid reservation update");

    await reservation.updateOne(update);

    const updatedReservation = await Reservation.findOne({ _id: id });

    return updatedReservation;
  } catch (error) {
    debug("%s", error);
    throw new Error(error);
  }
};

module.exports.get = async (filter, idOfLastFetchedReservation) => {
  try {
    const mongooseFilter = [];
    let reservations;

    //TODO: Refactore the filter and ifLastFetched into a seperate functions, because its the same as in offers
    if (filter) {
      for (const key in filter) {
        if (key === "collector" && filter[key].sub) {
          mongooseFilter.push({
            "collector.sub": filter[key].sub,
          });
        }

        if (key === "state") {
          mongooseFilter.push({
            [key]: filter[key],
          });
        }
        if (key === "until") {
          mongooseFilter.push({
            [key]: { $lt: filter[key] },
          });
        }
      }
    }

    if (mongooseFilter.length > 0 && idOfLastFetchedReservation) {
      reservations = await Reservation.find({
        $or: mongooseFilter,
        $and: [{ _id: { $lt: idOfLastFetchedReservation.toString() } }],
      })
        .sort({ created_at: "desc" })
        .limit(ITEMS_PER_PAGE);
    }

    if (mongooseFilter.length > 0 && !idOfLastFetchedReservation) {
      reservations = await Reservation.find({
        $or: mongooseFilter,
      })
        .sort({ created_at: "desc" })
        .limit(ITEMS_PER_PAGE);
    }

    if (!filter && idOfLastFetchedReservation) {
      reservations = await Reservation.find({
        _id: { $lt: idOfLastFetchedReservation.toString() },
      })
        .sort({ created_at: "desc" })
        .limit(ITEMS_PER_PAGE);
    }

    if (!filter && !idOfLastFetchedReservation) {
      reservations = await Reservation.find()
        .sort({ created_at: "desc" })
        .limit(ITEMS_PER_PAGE);
    }

    return reservations;
  } catch (error) {
    debug("%s", error);
    throw new Error(error);
  }
};

module.exports.getById = async (id) => {
  const idIsValid = mongoose.Types.ObjectId.isValid(id);
  if (!idIsValid) throw new Error("invalid reservation id");

  const reservation = await Reservation.findOne({ _id: id });

  return reservation;
};

module.exports.getByUser = async (user) => {
  if (!user?.sub || typeof user !== "object" || Array.isArray(user))
    throw new Error("invalid user");

  const reservations = await Reservation.find({
    $and: [
      { "collector.sub": user.sub },
      {
        $or: [
          { state: "reserved" },
          { state: "expired" },
          { state: "pickedup" },
        ],
      },
    ],
  });

  const offersPromises = reservations.map((reservation) => {
    return OfferController.getById(reservation.offer);
  });
  const offersFromReservations = await Promise.all(offersPromises);

  const reservationsWithOffers = reservations.map((reservation, index) => {
    reservation.offer = offersFromReservations[index];
    return reservation;
  });

  return reservationsWithOffers;
};

module.exports.delete = async function (id) {
  try {
    const reservationToDelete = await Reservation.findOne({ _id: id });
    if (!reservationToDelete)
      throw new Error("No reservation found with id: ", id);

    await reservationToDelete.remove();

    return true;
  } catch (error) {
    debug("%s", error);
    throw new Error(error);
  }
};
