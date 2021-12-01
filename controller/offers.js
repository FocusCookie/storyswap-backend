const debug = require("debug")("CONTROLLER:OFFERS");
const Offer = require("../models/offer");

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

    const { provider, book, zip, city, state, collector } = update;

    if (collector && (!collector.sub || !collector.nickname))
      throw new Error(
        `invalid collector ${!collector.sub ? "sub is required" : ""} ${
          !collector.nickname ? "nickname is required" : ""
        }`
      );

    validUpdateProps = {
      ...provider,
      ...book,
      ...zip,
      ...city,
      ...state,
      ...collector,
    };

    if (Object.values(validUpdateProps).length === 0)
      throw new Error("invalid offer update");

    const offerToUpdate = await Offer.findOne({ _id: id });
    if (!offerToUpdate) throw new Error("No offer found with id: ", id);

    await offerToUpdate.updateOne(update);

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
