module.exports = function (app) {
  const config = require("config");
  const session = require("express-session");

  const options = config.session;

  if (app.get("env") === "production") {
    // Use secure cookies in production (requires SSL/TLS)
    options.cookie.secure = true;

    // Uncomment the line below if your application is behind a proxy (like on Heroku)
    // or if you're encountering the error message:
    // "Unable to verify authorization request state"
    // app.set('trust proxy', 1);
  }

  app.use(session(options));
};
