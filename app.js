const fs = require("fs");
const express = require("express");
require("dotenv").config();
const https = require("https");
const http = require("http");
const app = express();
const config = require("config");

const httpsKey = fs.readFileSync("./certificates/server.key");
const httpsCert = fs.readFileSync("./certificates/server.cert");

const ensureHttps = require("./middleware/ensureHttps.js");
const startup = require("debug")("APP");

// Middlewares
app.all("*", ensureHttps);

// ROUTES
require("./start/routes")(app);

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
