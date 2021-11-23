const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const error = require("../middleware/error");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const jwt = require("express-jwt");
const jwks = require("jwks-rsa");

const test = require("../routes/test");
const indexRouter = require("../routes/index");

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

  // JWT
  const checkForValidJwt = jwt({
    secret: jwks.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: "https://storyswap.eu.auth0.com/.well-known/jwks.json",
    }),
    audience: "https://api.storyswap.app",
    issuer: "https://storyswap.eu.auth0.com/",
    algorithms: ["RS256"],
  });

  app.use(checkForValidJwt);

  app.use("/test", test);
  app.use("/", indexRouter);

  // catch 404 and forward to error handler
  app.use((req, res, next) => {
    const err = new Error("Not Found");
    err.status = 404;
    next(err);
  });

  app.use(error);
};
