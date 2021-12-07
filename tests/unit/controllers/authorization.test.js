const authorization = require("../../../controller/authorization");

describe("Authorization offers userIsProvider", () => {
  const validUser = { sub: "foo" };
  const validOffer = { provider: { sub: "bar" } };

  it("should throw an invalid user and offer error if no user and offer is given", () => {
    expect(authorization.offers.userIsProvider).toThrow(
      /invalid user and offer/gi
    );
  });

  it("should throw an invalid user if the given user is not an object", () => {
    expect(() => authorization.offers.userIsProvider(2)).toThrow(
      /invalid user/gi
    );
    expect(() => authorization.offers.userIsProvider("foo")).toThrow(
      /invalid user/gi
    );
    expect(() => authorization.offers.userIsProvider([])).toThrow(
      /invalid user/gi
    );
    expect(() => authorization.offers.userIsProvider(true)).toThrow(
      /invalid user/gi
    );
  });

  it("should throw an invalid user error if no sub property is provided in the user", () => {
    expect(() => authorization.offers.userIsProvider({ foo: "bar" })).toThrow(
      /invalid user/gi
    );
  });

  it("should throw an invalid offer error if offer is provided", () => {
    expect(() => authorization.offers.userIsProvider(validUser)).toThrow(
      /invalid offer/gi
    );
  });

  it("should throw an invalid offer if the given offer is not an object", () => {
    expect(() => authorization.offers.userIsProvider(validUser, 1)).toThrow(
      /invalid offer/gi
    );
    expect(() => authorization.offers.userIsProvider(validUser, "foo")).toThrow(
      /invalid offer/gi
    );
    expect(() => authorization.offers.userIsProvider(validUser, [])).toThrow(
      /invalid offer/gi
    );
    expect(() => authorization.offers.userIsProvider(validUser, true)).toThrow(
      /invalid offer/gi
    );
  });

  it("should throw an invalid offer error if no provider.sub property is provided in the offer", () => {
    expect(() =>
      authorization.offers.userIsProvider(validUser, { foo: "bar" })
    ).toThrow(/invalid offer/gi);
  });

  it("should return false if the user is not the provider of the offer", () => {
    const isProvider = authorization.offers.userIsProvider(
      validUser,
      validOffer
    );

    expect(isProvider).toBeFalsy();
  });

  it("should return true if the user is  the provider of the offer", () => {
    validOffer.provider.sub = validUser.sub;

    const isProvider = authorization.offers.userIsProvider(
      validUser,
      validOffer
    );

    expect(isProvider).toBeTruthy();
  });
});

describe("Authorization reservations userIsCollector", () => {
  const validUser = { sub: "foo" };
  const validReservation = { collector: { sub: "bar" } };

  it("should throw an invalid user and reservation error if no user and offer is given", () => {
    expect(authorization.reservations.userIsCollector).toThrow(
      /invalid user and reservation/gi
    );
  });

  it("should throw an invalid user if the given user is not an object", () => {
    expect(() => authorization.reservations.userIsCollector(2)).toThrow(
      /invalid user/gi
    );
    expect(() => authorization.reservations.userIsCollector("foo")).toThrow(
      /invalid user/gi
    );
    expect(() => authorization.reservations.userIsCollector([])).toThrow(
      /invalid user/gi
    );
    expect(() => authorization.reservations.userIsCollector(true)).toThrow(
      /invalid user/gi
    );
  });

  it("should throw an invalid user error if no sub property is provided in the user", () => {
    expect(() =>
      authorization.reservations.userIsCollector({ foo: "bar" })
    ).toThrow(/invalid user/gi);
  });

  it("should throw an invalid reservation error if reservation is provided", () => {
    expect(() => authorization.reservations.userIsCollector(validUser)).toThrow(
      /invalid reservation/gi
    );
  });

  it("should throw an invalid reservation if the given reservation is not an object", () => {
    expect(() =>
      authorization.reservations.userIsCollector(validUser, 1)
    ).toThrow(/invalid reservation/gi);
    expect(() =>
      authorization.reservations.userIsCollector(validUser, "foo")
    ).toThrow(/invalid reservation/gi);
    expect(() =>
      authorization.reservations.userIsCollector(validUser, [])
    ).toThrow(/invalid reservation/gi);
    expect(() =>
      authorization.reservations.userIsCollector(validUser, true)
    ).toThrow(/invalid reservation/gi);
  });

  it("should throw an invalid reservation error if no provider.sub property is provided in the offer", () => {
    expect(() =>
      authorization.reservations.userIsCollector(validUser, { foo: "bar" })
    ).toThrow(/invalid reservation/gi);
  });

  it("should return false if the user is not the provider of the reservation", () => {
    const isCollector = authorization.reservations.userIsCollector(
      validUser,
      validReservation
    );

    expect(isCollector).toBeFalsy();
  });

  it("should return true if the user is  the provider of the reservation", () => {
    validReservation.collector.sub = validUser.sub;

    const isCollector = authorization.reservations.userIsCollector(
      validUser,
      validReservation
    );

    expect(isCollector).toBeTruthy();
  });
});
