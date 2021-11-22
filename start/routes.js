const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const error = require("../middleware/error");

const landing = require("../routes/landing");

module.exports = function (app) {
  app.use(express.json());
  app.use(helmet());
  app.use(cors()); //TODO: remove if frontend is hosted via backend, otherwise restrict cors to a whitelist
  app.use(morgan("tiny"));

  app.get("/", (req, res) => {
    res.send("Hello World!");
  });

  app.use("/", landing);

  // catch 404 and forward to error handler
  app.use((req, res, next) => {
    const err = new Error("Not Found");
    err.status = 404;
    next(err);
  });

  app.use(error);
};
