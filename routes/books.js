const express = require("express");
const router = express.Router();
const controller = require("../controller/books");

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

module.exports = router;
