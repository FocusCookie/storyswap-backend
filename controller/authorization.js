userIsProvider = function (user, offer) {
  if (Object.keys(arguments).length === 0)
    throw new Error("invalid user and offer");

  if (typeof user !== "object" || Array.isArray(user) || !user.sub)
    throw new Error("invalid user");

  if (
    typeof offer !== "object" ||
    Array.isArray(offer) ||
    !offer?.provider?.sub
  )
    throw new Error("invalid offer");

  return user.sub === offer.provider.sub;
};

userIsCollector = function (user, reservation) {
  if (Object.keys(arguments).length === 0)
    throw new Error("invalid user and reservation");

  if (typeof user !== "object" || Array.isArray(user) || !user.sub)
    throw new Error("invalid user");

  if (
    typeof reservation !== "object" ||
    Array.isArray(reservation) ||
    !reservation?.collector?.sub
  )
    throw new Error("invalid reservation");

  return user.sub === reservation.collector.sub;
};

//TODO: isAdmin

const offers = {
  userIsProvider,
};

const reservations = {
  userIsCollector,
};

module.exports = { offers, reservations };
