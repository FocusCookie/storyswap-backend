require("dotenv").config();
const config = require("config");
const debug = require("debug")("CONTROLLER:BOOKS");
const { Book } = require("../models/book");
var objectID = require("mongodb").ObjectID;

//TODO: Move into an own init file
const isbnApiKey = config.isbndb.apiKey;
if (!isbnApiKey) throw new Error("ISBNDB API KEY not setup in env vars");

module.exports.create = async function (isbnOrIsbn13) {
  if (!book) throw new Error("invalid book");

  const existingBook = await Book.find({
    isbn: isbnOrIsbn13,
    isbn13: isbnOrIsbn13,
  });

  if (existingBook) {
    return existingBook;
  } else {
    // if not call isbn db
    // if book exists create book
    // if book does not exits return error book is not available
  }

  const newThing = new AwsThing(thingSchema);

  newThing
    .save()
    .then((result) => {
      debug(
        `AWS Thing for thing ${newThing.thingName} successfully created created`
      );
      debug(newThing);
      resolve(result);
    })
    .catch((err) => {
      debug(err);
      reject(
        new Error(
          "Something broke while creating AWS Thing - Storing to DB",
          err
        )
      );
    });
};
