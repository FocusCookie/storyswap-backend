require("dotenv").config();
const config = require("config");
const axios = require("axios");
const debug = require("debug")("SERVICES:ISBNDB");

const instance = axios.create({
  baseURL: "https://api2.isbndb.com/",
  headers: { Authorization: config.isbndb.apiKey },
});

module.exports.getBookByIsbnOrIsbn13 = async (isbnOrIsbn13) => {
  try {
    if (!isbnOrIsbn13) throw new Error("invalid isbnOrIsbn13");
    if (isbnOrIsbn13.length < 9 || isbnOrIsbn13.length > 13)
      throw new Error("invalid isbnOrIsbn13");

    const onlyNumbersAndDashRegex = /^[0-9-]*$/;
    if (!onlyNumbersAndDashRegex.test(isbnOrIsbn13))
      throw new Error("invalid isbnOrIsbn13");

    const response = await instance.get(`book/${isbnOrIsbn13}`);
    const book = response.data.book;

    debug(book);

    return book;
  } catch (error) {
    debug("%s", error);
    throw new Error("ISBN API: ", error.message);
  }
};
