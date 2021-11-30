const debug = require("debug")("CONTROLLER:BOOKS");
const Book = require("../models/book");
const isbndb = require("../services/isbndb");
const isbnHelper = require("../helpers/isbn");
const mongoose = require("mongoose");

const ITEMS_PER_PAGE = 10;

module.exports.createBookInDatabase = async function (book) {
  //TODO: Sometimes the books from the api could have a not valid Date format for the published date, its some times only the year
  //TODO: build an check for date issues and replace them with a proper date
  try {
    if (!book) throw new Error("invalid book");
    const newBook = new Book(book);
    const bookExistsAlready = await Book.findOne({
      $or: [{ isbn: book.isbn }, { isbn13: book.isbn13 }],
    });

    if (bookExistsAlready) return bookExistsAlready;

    const validatedBook = newBook.validateSync();
    const validationErrors = validatedBook
      ? Object.values(validatedBook.errors).map((err) => err.message)
      : null;

    if (validationErrors) {
      throw new Error(`invalid book - ${validationErrors.join(" - ")}`);
    }

    const storedBook = await newBook.save();

    return storedBook;
  } catch (error) {
    debug("%s", error);
    throw new Error(error);
  }
};

module.exports.createBookWithIsbnOrIsbn13 = async (isbnOrIsbn13) => {
  try {
    if (!isbnHelper.isValideIsbnOrIsbn13(isbnOrIsbn13))
      throw new Error("invalid ISBN or ISBN13");

    const bookIsInDatabase = await Book.findOne({
      $or: [
        {
          isbn: isbnOrIsbn13,
        },
        {
          isbn13: isbnOrIsbn13,
        },
      ],
    });

    if (bookIsInDatabase) return bookIsInDatabase;

    const bookFromIsbnDb = await isbndb.getBookByIsbnOrIsbn13(isbnOrIsbn13);

    const bookStoredInDatabase = await this.createBookInDatabase(
      bookFromIsbnDb
    );

    return bookStoredInDatabase;
  } catch (error) {
    debug("%s", error);
    throw new Error(error);
  }
};

module.exports.getBooks = async (filter, idOfLastFetchedBook) => {
  try {
    const mongooseFilter = [];
    let books;

    if (filter) {
      for (const key in filter) {
        const filterRegex = new RegExp(filter[key], "ig");
        mongooseFilter.push({
          [key]: filterRegex,
        });
      }
    }

    if (filter && idOfLastFetchedBook) {
      books = await Book.find({
        $or: mongooseFilter,
        $and: [{ _id: { $gt: idOfLastFetchedBook.toString() } }],
      }).limit(ITEMS_PER_PAGE);
    }

    if (filter && !idOfLastFetchedBook) {
      books = await Book.find({
        $or: mongooseFilter,
      }).limit(ITEMS_PER_PAGE);
    }

    if (!filter && idOfLastFetchedBook) {
      books = await Book.find({
        _id: { $gt: idOfLastFetchedBook.toString() },
      }).limit(ITEMS_PER_PAGE);
    }

    if (!filter && !idOfLastFetchedBook) {
      books = await Book.find().limit(ITEMS_PER_PAGE);
    }

    return books;
  } catch (error) {
    debug("%s", error);
    throw new Error(error);
  }
};

module.exports.getBookById = async (id) => {
  const idIsValid = mongoose.Types.ObjectId.isValid(id);
  if (!idIsValid) throw new Error("invalid book id");

  const book = await Book.findOne({ _id: id });

  return book;
};
