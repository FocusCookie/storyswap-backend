require("dotenv").config();
const config = require("config");
const debug = require("debug")("CONTROLLER:USER");

var ManagementClient = require("auth0").ManagementClient;
var auth0 = new ManagementClient({
  domain: config.auth0.domain,
  clientId: config.auth0.management.clientId,
  clientSecret: config.auth0.management.clientSecret,
  scope:
    "read:users update:users read:users_app_metadata update:users_app_metadata delete:users_app_metadata create:users_app_metadata",
});

module.exports.getUserProfile = async (userSub) => {
  try {
    // const user = await auth0.getUser({ id: userSub });

    return false;
  } catch (error) {
    debug("%s", error);
    throw new Error(error);
  }
};
