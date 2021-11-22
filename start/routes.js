const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const error = require("../middleware/error");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const test = require("../routes/test");
const userInViews = require("../middleware/userInViews");
const authRouter = require("../routes/auth");
const indexRouter = require("../routes/index");
const usersRouter = require("../routes/users");

module.exports = function (app) {
  app.use(express.json());
  app.use(helmet());
  app.use(cors()); //TODO: remove if frontend is hosted via backend, otherwise restrict cors to a whitelist
  app.use(morgan("tiny"));
  app.use(cookieParser()); // read cookies (needed for auth)

  // parse application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: false }));
  // parse application/json
  app.use(bodyParser.json());

  /*   app.get("/", (req, res) => {
    res.send("Hello World!");
  }); */

  app.use(userInViews());
  app.use("/", authRouter);
  app.use("/", indexRouter);
  app.use("/", usersRouter);

  app.use("/test", test);

  // catch 404 and forward to error handler
  app.use((req, res, next) => {
    const err = new Error("Not Found");
    err.status = 404;
    next(err);
  });

  app.use(error);
};
