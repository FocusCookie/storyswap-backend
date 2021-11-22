const fs = require("fs");
const express = require("express");
require("dotenv").config();
const https = require("https");
const http = require("http");
const app = express();
const cors = require("cors");
const helmet = require("helmet");
const config = require("config");

const httpsKey = fs.readFileSync("./certificates/server.key");
const httpsCert = fs.readFileSync("./certificates/server.cert");

const ensureHttps = require("./middleware/ensureHttps.js");
const debug = require("./middleware/debuger.js");
const startup = require("debug")("APP");

console.log(config);

app.use(helmet());
app.use(cors()); // remove if frontend is hosted via backend, otherwise restrict cors to a whitelist

// Middlewares
app.all("*", debug.requests);
app.all("*", ensureHttps);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error("Not Found");
  console.log(err);
  err.status = 404;
  res.send("Route not found");
  next(err);
  //TODO:ERROR HANDLER
});

http
  .createServer(app)
  .listen(config.server.httpPort, config.server.host, () => {
    startup(
      `Example app listening at http://${config.server.host}:${config.server.httpPort}`
    );
  });

https
  .createServer(
    {
      key: httpsKey,
      cert: httpsCert,
    },
    app
  )
  .listen(config.server.httpsPort, config.server.host, () => {
    startup(
      `Example app listening at https://${config.server.host}:${config.server.httpsPort}`
    );
  });
