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
    if (!userSub || typeof userSub !== "string")
      throw new TypeError("invalid userSub");

    const userprofile = await auth0.getUser({ id: userSub });

    return userprofile;
  } catch (error) {
    debug("%s", error);
    throw new Error(error);
  }
};

module.exports.getUserMetadata = async (userSub) => {
  try {
    const userprofile = await this.getUserProfile(userSub);

    return userprofile.user_metadata;
  } catch (error) {
    debug("%s", error);
    throw new Error(error);
  }
};

module.exports.updateUserMetadata = async (userSub, metadata) => {
  try {
    if (!userSub || typeof userSub !== "string")
      throw new TypeError("invalid userSub");

    if (!metadata || typeof metadata !== "object" || Array.isArray(metadata))
      throw new TypeError("invalid metadata");

    const currentMetadata = await this.getUserMetadata(userSub);

    const updatedUser = await auth0.updateUserMetadata(
      { id: userSub },
      { ...currentMetadata, ...metadata }
    );

    return updatedUser.user_metadata;
  } catch (error) {
    debug("%s", error);
    throw new Error(error);
  }
};

module.exports.updateUser = async (userSub, update) => {
  try {
    if (!userSub || typeof userSub !== "string")
      throw new TypeError("invalid userSub");

    if (!update || typeof update !== "object" || Array.isArray(update))
      throw new TypeError("invalid update");

    const currentProfile = await this.getUserProfile(userSub);

    //* not allowed in the update
    delete currentProfile.logins_count;
    delete currentProfile.last_login;
    delete currentProfile.last_ip;
    delete currentProfile.user_id;
    delete currentProfile.updated_at;
    delete currentProfile.identities;
    delete currentProfile.created_at;

    const validUpdate = { ...currentProfile, ...update };

    const updatedUser = await auth0.updateUser({ id: userSub }, validUpdate);

    return updatedUser;
  } catch (error) {
    debug("%s", error);
    throw new Error(error);
  }
};

//TODO: implement deleteUser and change password
