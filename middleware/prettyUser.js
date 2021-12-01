// * This middleware will transform the scoped user properties into regular properties to better work with

module.exports = (req, res, next) => {
  if (
    !req.user ||
    !req.user["https://api.storyswap.app/nickname"] ||
    !req.user["https://api.storyswap.app/roles"] ||
    !req.user["https://api.storyswap.app/picture"]
  ) {
    return next();
  }

  req.user.nickname = req.user["https://api.storyswap.app/nickname"] + "";
  req.user.roles = req.user["https://api.storyswap.app/roles"].map(
    (role) => role
  );
  req.user.picture = req.user["https://api.storyswap.app/picture"] + "";

  delete req.user["https://api.storyswap.app/nickname"];
  delete req.user["https://api.storyswap.app/roles"];
  delete req.user["https://api.storyswap.app/picture"];

  return next();
};
