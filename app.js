const fs = require("fs");
const express = require("express");
const https = require("https");
const http = require("http");
const app = express();
require("dotenv").config();
const config = require("config");

require("./init/mongodb");

const httpsKey = fs.readFileSync("./certificates/server.key");
const httpsCert = fs.readFileSync("./certificates/server.cert");

const ensureHttps = require("./middleware/ensureHttps.js");
const startup = require("debug")("APP");

//TODO: move in in init file in init
const isbnApiKey = config.isbndb.apiKey;
if (!isbnApiKey) throw new Error("ISBNDB API KEY not setup in env vars");

// Middlewares
app.all("*", ensureHttps);

// ROUTES
require("./init/routes")(app);

//TODO: Scheduler
// delete all expired reservations and set offers to pending and set resertaoin tuo null
// if offer is pickedup and resrvation is pickedup -> make the credits exchange

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
