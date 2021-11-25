const ensureHttps = require("../../../middleware/ensureHttps");
var httpMocks = require("node-mocks-http");
require("dotenv").config();
const config = require("config");

describe("ensureHttps", () => {
  it("should call the redierect function", () => {
    const res = httpMocks.createResponse();
    const host = "localhost";
    res.redirect = jest.fn();
    const req = httpMocks.createRequest({
      method: "GET",
      url: "/",
      hostname: host,
    });

    ensureHttps(req, res);
    expect(res.redirect).toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith(
      `https://${host}:${config.server.httpsPort}/`
    );
  });

  it("should call next https is given", () => {
    const res = httpMocks.createResponse();
    const host = "https://localhost";
    const next = jest.fn();

    const req = httpMocks.createRequest({
      method: "GET",
      url: "/",
      hostname: host,
    });

    ensureHttps(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
