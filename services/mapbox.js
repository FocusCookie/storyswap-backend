require("dotenv").config();
const config = require("config");
const axios = require("axios");
const debug = require("debug")("SERVICES:MAPBOX");

const authParam = `&access_token=${config.mapbox.apiKey}`;

const instance = axios.create({
  baseURL: "https://api.mapbox.com/geocoding/v5/mapbox.places/",
});

module.exports.getZipCoordinates = async (zip, city) => {
  try {
    if (!zip || typeof zip !== "number") throw new TypeError("invalid zip");
    if (zip < 10000 || zip > 99999) throw new Error("zip needs to be 5 digits");

    if (!city || typeof city !== "string") throw new TypeError("invalid city");

    const response = await instance.get(
      `${zip}.json?types=postcode${authParam}`
    );
    const postcodes = response.data.features;

    //look if city and zip matches booth in one postcode
    const match = postcodes.filter((postcode) =>
      postcode.place_name.toLowerCase().includes(city.toLowerCase())
    );

    return match[0] ? match[0].center : null;
  } catch (error) {
    const message =
      error.response && error.response.status === 404
        ? "not found"
        : error.message;
    debug("%s", error);
    throw new Error(`MAPBOX API: ${message}`);
  }
};
