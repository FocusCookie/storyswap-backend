const express = require("express");
const router = express.Router();
const debug = require("debug")("ROUTES:BOOKS");
const controller = require("../controller/books");
const { validate } = require("../models/book");

router.get("/", async (req, res) => {
  try {
    const books = await controller.getBooks();
    res.send(books);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const book = await controller.getBookById(id);
    res.send(book);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const validation = validate(req.body);
    if (validation.error) throw { status: 400, message: validation.error };

    const isbn = req.body.isbn;
    const isbn13 = req.body.isbn13;

    if (!isbn && !isbn13)
      throw { status: 400, message: "isbn or isbn13 required" };

    const isbnOrIsbn13 = isbn ? isbn : isbn13;

    const createdBook = await controller.createBookWithIsbnOrIsbn13(
      isbnOrIsbn13
    );

    debug("createdBook");

    res.send(createdBook);
  } catch (error) {
    debug("%s", error);
    next(error);
  }
});

module.exports = router;
