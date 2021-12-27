require("dotenv").config();
const config = require("config");
const debug = require("debug")("CONTROLLER:USER");
const { isValidEmail } = require("../helpers/util");

const ManagementClient = require("auth0").ManagementClient;
const auth0Management = new ManagementClient({
  domain: config.auth0.domain,
  clientId: config.auth0.management.clientId,
  clientSecret: config.auth0.management.clientSecret,
  scope:
    "read:users update:users read:users_app_metadata update:users_app_metadata delete:users_app_metadata create:users_app_metadata delete:users",
});

const AuthenticationClient = require("auth0").AuthenticationClient;
const auth0Authentication = new AuthenticationClient({
  domain: config.auth0.domain,
  clientId: config.auth0.management.clientId,
  clientSecret: config.auth0.management.clientSecret,
});

module.exports.getUserProfile = async (userSub) => {
  try {
    if (!userSub || typeof userSub !== "string")
      throw new TypeError("invalid userSub");

    const userprofile = await auth0Management.getUser({ id: userSub });

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

    const updatedUser = await auth0Management.updateUserMetadata(
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

    const updatedUser = await auth0Management.updateUser(
      { id: userSub },
      validUpdate
    );

    return updatedUser;
  } catch (error) {
    debug("%s", error);
    throw new Error(error);
  }
};

module.exports.requestChangePasswordEmail = async (email, connection) => {
  try {
    const validEmail = isValidEmail(email);
    if (!validEmail) throw new TypeError("invalid email");
    if (!connection || typeof connection !== "string")
      throw new TypeError("invalid connection");

    const data = {
      email: email,
      client_id: config.auth0.management.clientId,
      connection: connection,
    };

    const changeWasSendViaMailToUser =
      await auth0Authentication.requestChangePasswordEmail(data);

    return changeWasSendViaMailToUser;
  } catch (error) {
    debug("%s", error);
    throw new Error(error);
  }
};

module.exports.delteUserBySub = async (userSub) => {
  try {
    if (!userSub || typeof userSub !== "string")
      throw new TypeError("invalid userSub");

    await auth0Management.deleteUser({ id: userSub });

    return true;
  } catch (error) {
    debug("%s", error);
    throw new Error(error);
  }
};
