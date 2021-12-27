const debug = require("debug")("CONTROLLER:OFFERS");
const Offer = require("../models/offer");
const BookController = require("../controller/books");
const ReservationController = require("../controller/reservations");
const PostalcodeController = require("../controller/postalcodes");
const mongoose = require("mongoose");

const ITEMS_PER_PAGE = 10;

module.exports.create = async function (offer) {
  try {
    if (!offer || typeof offer !== "object" || Array.isArray(offer))
      throw new Error("invalid offer");

    const bookExists = await BookController.getBookById(offer.book);
    if (!bookExists) throw new Error("No book found with id: ", offer.book);

    // check if postal code exists for given zip and city
    const postalcode = await PostalcodeController.createWithZipAndCity(
      offer.zip,
      offer.city
    );

    offer.coordinates = postalcode.coordinates;

    const newOffer = new Offer(offer);

    const validatedOffer = newOffer.validateSync();
    const validationErrors = validatedOffer
      ? Object.values(validatedOffer.errors).map((err) => err.message)
      : null;

    if (validationErrors) {
      throw new Error(`invalid offer - ${validationErrors.join(" - ")}`);
    }

    const createdOffer = await newOffer.save();

    return createdOffer;
  } catch (error) {
    debug("%s", error);
    throw new Error(error);
  }
};

module.exports.update = async function (id, update) {
  try {
    if (!update || typeof update !== "object" || Array.isArray(update))
      throw new Error("invalid offer");

    let validUpdateProps = {};

    for (let prop in update) {
      if (
        prop === "provider" ||
        prop === "book" ||
        prop === "zip" ||
        prop === "city" ||
        prop === "state" ||
        prop === "reservation"
      )
        validUpdateProps[prop] = update[prop];
    }

    if (Object.values(validUpdateProps).length === 0)
      throw new Error("invalid offer update");

    const offerToUpdate = await Offer.findOne({ _id: id });
    if (!offerToUpdate) throw new Error("No offer found with id: ", id);

    await offerToUpdate.updateOne(validUpdateProps);

    const updatedOffer = await Offer.findOne({ _id: id });

    return updatedOffer;
  } catch (error) {
    debug("%s", error);
    throw new Error(error);
  }
};

module.exports.get = async function (filter, lastFatchedOfferId) {
  try {
    const mongooseFilter = [];
    let offers;

    if (filter) {
      for (const key in filter) {
        if (key === "provider" && filter[key].sub) {
          mongooseFilter.push({
            "provider.sub": filter[key].sub,
          });
        }

        if (key === "book" || key === "zip" || key === "state") {
          // * book should be a book._id an id cant be searched via a regex
          mongooseFilter.push({
            [key]: filter[key],
          });
        }

        if (key === "city") {
          const filterRegex = new RegExp(filter[key], "ig");
          mongooseFilter.push({
            [key]: filterRegex,
          });
        }
      }
    }

    debug("mongooseFilter ", mongooseFilter);

    if (mongooseFilter.length > 0 && lastFatchedOfferId) {
      offers = await Offer.find({
        $and: mongooseFilter,
        $and: [{ _id: { $lt: lastFatchedOfferId.toString() } }],
      })
        .sort({ created_at: "desc" })
        .limit(ITEMS_PER_PAGE);
    }

    if (mongooseFilter.length > 0 && !lastFatchedOfferId) {
      offers = await Offer.find({
        $and: mongooseFilter,
      })
        .sort({ created_at: "desc" })
        .limit(ITEMS_PER_PAGE);
    }

    if (!filter && lastFatchedOfferId) {
      offers = await Offer.find({
        _id: { $lt: lastFatchedOfferId.toString() },
      })
        .sort({ created_at: "desc" })
        .limit(ITEMS_PER_PAGE);
    }

    if (!filter && !lastFatchedOfferId) {
      offers = await Offer.find()
        .sort({ created_at: "desc" })
        .limit(ITEMS_PER_PAGE);
    }

    const booksPromises = offers.map((offer) => {
      return BookController.getBookById(offer.book.toString());
    });
    const booksFromOffers = await Promise.all(booksPromises);

    const offersWithBooks = offers.map((offer, index) => {
      offer.book = booksFromOffers[index];
      return offer;
    });

    return offersWithBooks;
  } catch (error) {
    debug("%s", error);
    throw new Error(error);
  }
};

module.exports.getById = async function (id) {
  const idIsValid = mongoose.Types.ObjectId.isValid(id);
  if (!idIsValid) throw new Error("invalid offer id");

  const offer = await Offer.findOne({ _id: id });

  const bookFromOffer = await BookController.getBookById(offer.book.toString());

  offer.book = bookFromOffer;

  return offer;
};

module.exports.getByUser = async function (user) {
  if (!user?.sub || typeof user !== "object" || Array.isArray(user))
    throw new Error("invalid user");

  const offers = await Offer.find({
    $and: [
      { "provider.sub": user.sub },
      {
        $or: [
          { state: "pending" },
          { state: "reserved" },
          { state: "pickedup" },
        ],
      },
    ],
  }).sort({ created_at: "desc" });

  const booksPromises = offers.map((offer) => {
    return BookController.getBookById(offer.book.toString());
  });
  const booksFromOffers = await Promise.all(booksPromises);

  const reservationsPromises = offers.map((offer) => {
    if (offer.reservation)
      return ReservationController.getById(offer.reservation);
    return false;
  });
  const reservationsFromOffer = await Promise.all(reservationsPromises);

  const offersWithBooksAndReservation = offers.map((offer, index) => {
    if (reservationsFromOffer[index]) {
      offer.reservation = reservationsFromOffer[index];
    }
    offer.book = booksFromOffers[index];

    return offer;
  });

  return offersWithBooksAndReservation;
};
