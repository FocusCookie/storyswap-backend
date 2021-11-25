const debug = require("debug")("CONTROLLER:BOOKS");
const { Book } = require("../models/book");

module.exports.create = async function (book) {
  if (!book) throw new Error("invalid book");
};
