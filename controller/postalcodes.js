const debug = require("debug")("CONTROLLER:POSTALCODES");
const { Postalcode } = require("../models/postalcode");
const { getZipCoordinates } = require("../services/mapbox");

module.exports.createWithZipAndCity = async function (zip, city) {
  try {
    if (!zip || typeof zip !== "number") throw new TypeError("invalid zip");
    if (zip < 10000 || zip > 99999) throw new Error("zip needs to be 5 digits");
    if (!city || typeof city !== "string") throw new TypeError("invalid city");

    const postalcodeExists = await Postalcode.findOne({
      $and: [{ zip: zip }, { city: city }],
    });

    if (postalcodeExists) {
      return postalcodeExists;
    } else {
      const coordinates = await getZipCoordinates(zip, city);

      if (!coordinates)
        throw new Error(`No coordinates found for ${zip} ${city}`);

      const newPostalcode = new Postalcode({
        coordinates: coordinates,
        city: city,
        zip: zip,
      });

      const storedPostalcode = await newPostalcode.save();

      return storedPostalcode;
    }
  } catch (error) {
    debug("%s", error);
    throw new Error(error);
  }
};
