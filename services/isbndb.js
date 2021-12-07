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
    const book = response.data.book;

    return book;
  } catch (error) {
    const message = error.response.status === 404 ? "not found" : error.message;
    debug("%s", error);
    throw new Error(`ISBN API: ${message}`);
  }
};
