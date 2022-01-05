require("dotenv").config();
const config = require("config");
const axios = require("axios");
const debug = require("debug")("SERVICES:ISBNDB");
const isbnHelper = require("../helpers/isbn");

const instance = axios.create({
  baseURL: "https://api2.isbndb.com/",
  headers: { Authorization: config.isbndb.apiKey },
});

module.exports.getBookByIsbnOrIsbn13 = async (isbnOrIsbn13) => {
  try {
    if (!isbnHelper.isValideIsbnOrIsbn13(isbnOrIsbn13))
      throw new Error("invalid isbn or isbn13");

    const response = await instance.get(`book/${isbnOrIsbn13}`);

    //* ISBN sends an {errorMessage: } if no book was found with the given isbn
    return response.data.book;
  } catch (error) {
    if (error.response.status === 404) {
      return false;
    } else {
      debug(error);
      throw new Error(`ISBN API: ${message}`);
    }
  }
};
