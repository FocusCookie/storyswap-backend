const express = require("express");
const router = express.Router();
const controller = require("../controller/books");

router.get("/", async (req, res) => {
  const books = await controller.getBooks();
  res.send(books);
});

module.exports = router;
