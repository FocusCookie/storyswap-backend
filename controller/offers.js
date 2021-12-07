const debug = require("debug")("CONTROLLER:OFFERS");
const Offer = require("../models/offer");
const mongoose = require("mongoose");

const ITEMS_PER_PAGE = 10;

module.exports.create = async function (offer) {
  try {
    if (!offer || typeof offer !== "object" || Array.isArray(offer))
      throw new Error("invalid offer");

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

    if (mongooseFilter.length > 0 && lastFatchedOfferId) {
      offers = await Offer.find({
        $or: mongooseFilter,
        $and: [{ _id: { $gt: lastFatchedOfferId.toString() } }],
      }).limit(ITEMS_PER_PAGE);
    }

    if (mongooseFilter.length > 0 && !lastFatchedOfferId) {
      offers = await Offer.find({
        $or: mongooseFilter,
      }).limit(ITEMS_PER_PAGE);
    }

    if (!filter && lastFatchedOfferId) {
      offers = await Offer.find({
        _id: { $gt: lastFatchedOfferId.toString() },
      }).limit(ITEMS_PER_PAGE);
    }

    if (!filter && !lastFatchedOfferId) {
      offers = await Offer.find().limit(ITEMS_PER_PAGE);
    }

    return offers;
  } catch (error) {
    debug("%s", error);
    throw new Error(error);
  }
};

module.exports.getById = async function (id) {
  const idIsValid = mongoose.Types.ObjectId.isValid(id);
  if (!idIsValid) throw new Error("invalid offer id");

  const offer = await Offer.findOne({ _id: id });

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
          { state: "pickedup" },
          { state: "reserved" },
        ],
      },
    ],
  });

  return offers;
};
