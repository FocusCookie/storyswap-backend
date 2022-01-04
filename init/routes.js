const express = require("express");
const path = require("path");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const error = require("../middleware/error");
const bodyParser = require("body-parser");
const { expressCspHeader, NONE, SELF } = require("express-csp-header");

const books = require("../routes/books");
const offers = require("../routes/offers");
const reservations = require("../routes/reservations");
const chats = require("../routes/chats");
const messages = require("../routes/messages");
const user = require("../routes/user");
// const indexRouter = require("../routes/index");

module.exports = function (app) {
  app.use(express.json());
  app.use(helmet());
  app.use(cors()); //TODO: remove if frontend is hosted via backend, otherwise restrict cors to a whitelist
  app.use(morgan("tiny"));
  app.use(
    expressCspHeader({
      policies: {
        "default-src": [NONE],
        "script-src": [SELF],
        "img-src": [SELF],
      },
    })
  );

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  app.use("/api/books", books);
  app.use("/api/offers", offers);
  app.use("/api/reservations", reservations);
  app.use("/api/chats", chats);
  app.use("/api/messages", messages);
  app.use("/api/user", user);

  app.use(express.static(path.join(__dirname, "..", "client")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/index.html"));
  });

  // app.use("/", indexRouter);

  // catch 404 and forward to error handler
  app.use((req, res, next) => {
    const err = new Error("Not Found");
    err.status = 404;
    next(err);
  });

  app.use(error);
};
