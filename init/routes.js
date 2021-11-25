const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const auth = require("../middleware/auth");
const error = require("../middleware/error");
const bodyParser = require("body-parser");

const playground = require("../routes/playground");
const indexRouter = require("../routes/index");

module.exports = function (app) {
  app.use(express.json());
  app.use(helmet());
  app.use(cors()); //TODO: remove if frontend is hosted via backend, otherwise restrict cors to a whitelist
  app.use(morgan("tiny"));

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(auth);

  app.use("/playground", playground);
  app.use("/", indexRouter);

  // catch 404 and forward to error handler
  app.use((req, res, next) => {
    const err = new Error("Not Found");
    err.status = 404;
    next(err);
  });

  app.use(error);
};
