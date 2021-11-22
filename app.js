const fs = require("fs");
const express = require("express");
require("dotenv").config();
const https = require("https");
const http = require("http");
const app = express();
const host = process.env.DEV_SERVER_HOST;
const httpsPort = process.env.DEV_SERVER_HTTPS_PORT;
const httpPort = process.env.DEV_SERVER_HTTP_PORT;
const httpsKey = fs.readFileSync("./certificates/server.key");
const httpsCert = fs.readFileSync("./certificates/server.cert");

//check for https request if not redirect to https
app.all("*", ensureHttps); // at top of routing calls

function ensureHttps(req, res, next) {
  if (req.secure) {
    // OK, continue
    return next();
  }

  // heroku check
  if (req.headers["x-forwarded-proto"] === "https") {
    // OK, continue
    return next();
  }

  // handle port numbers if you need non defaults
  // res.redirect('https://' + req.host + req.url); // express 3.x
  res.redirect(`https://${req.hostname}:${httpsPort}${req.url}`); // express 4.x
}

app.get("/", (req, res) => {
  res.send("Hello World!");
});

http.createServer(app).listen(httpPort, host, () => {
  console.log(`Example app listening at http://${host}:${httpPort}`);
});

https
  .createServer(
    {
      key: httpsKey,
      cert: httpsCert,
    },
    app
  )
  .listen(httpsPort, host, () => {
    console.log(`Example app listening at https://${host}:${httpsPort}`);
  });
