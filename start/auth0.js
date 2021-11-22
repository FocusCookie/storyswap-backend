module.exports = function (app) {
  const config = require("config");
  const passport = require("passport");
  const Auth0Strategy = require("passport-auth0");

  // Configure Passport to use Auth0
  const strategy = new Auth0Strategy(
    {
      domain: config.auth0.domain,
      clientID: config.auth0.clientId,
      clientSecret: config.auth0.clientSecret,
      callbackURL:
        config.auth0.callbackURL ||
        `https://${config.server.host}:${config.server.httpsPort}/callback`,
    },
    function (accessToken, refreshToken, extraParams, profile, done) {
      // accessToken is the token to call Auth0 API (not needed in the most cases)
      // extraParams.id_token has the JSON Web Token
      // profile has all the information from the user
      return done(null, profile);
    }
  );

  passport.use(strategy);

  // You can use this section to keep a smaller payload
  passport.serializeUser(function (user, done) {
    done(null, user);
  });

  passport.deserializeUser(function (user, done) {
    done(null, user);
  });

  app.use(passport.initialize());
  app.use(passport.session());
};
