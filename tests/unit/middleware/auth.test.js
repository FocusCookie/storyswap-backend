require("dotenv").config();
const config = require("config");
const auth = require("../../../middleware/auth");
var httpMocks = require("node-mocks-http");

const validToken = `Bearer ${config.testing.authToken}`;
const invalidToken = "Bearer invalid";

describe("Auth middleware", () => {
  it("should send an 401 credentials_required if no auth header was set", () => {
    const res = httpMocks.createResponse();
    const req = httpMocks.createRequest({
      method: "GET",
      url: "/",
    });

    auth(req, res, (next) => {
      expect(next.status).toBe(401);
      expect(next.code).toBe("credentials_required");
    });
  });

  it("should send an 401 invalid_token if bearer token is invalid", () => {
    const res = httpMocks.createResponse();
    const req = httpMocks.createRequest({
      method: "GET",
      url: "/",
      headers: {
        authorization: invalidToken,
      },
    });

    auth(req, res, (next) => {
      expect(next.status).toBe(401);
      expect(next.code).toBe("invalid_token");
    });
  });

  it("should call next and return 200 and the user should be attached to the req", () => {
    const res = httpMocks.createResponse();
    const req = httpMocks.createRequest({
      method: "GET",
      url: "/",
      headers: {
        authorization: validToken,
      },
    });

    auth(req, res, () => {
      expect(res.statusCode).toBe(200);
      expect(req.user).toBeTruthy();
    });
  });
});

describe("A valid Token", () => {
  it("should include a nickname ", () => {
    const res = httpMocks.createResponse();
    const req = httpMocks.createRequest({
      method: "GET",
      url: "/",
      headers: {
        authorization: validToken,
      },
    });

    auth(req, res, () => {
      expect(req.user["https://api.storyswap.app/nickname"]).toBeTruthy();
    });
  });

  it("should include a picture property", () => {
    const res = httpMocks.createResponse();
    const req = httpMocks.createRequest({
      method: "GET",
      url: "/",
      headers: {
        authorization: validToken,
      },
    });

    auth(req, res, () => {
      expect(req.user["https://api.storyswap.app/picture"]).toBeTruthy();
    });
  });

  it("should include a roles property", () => {
    const res = httpMocks.createResponse();
    const req = httpMocks.createRequest({
      method: "GET",
      url: "/",
      headers: {
        authorization: validToken,
      },
    });

    auth(req, res, () => {
      expect(req.user["https://api.storyswap.app/roles"]).toBeTruthy();
    });
  });

  it("should include permissions property", () => {
    const res = httpMocks.createResponse();
    const req = httpMocks.createRequest({
      method: "GET",
      url: "/",
      headers: {
        authorization: validToken,
      },
    });

    auth(req, res, () => {
      expect(req.user.permissions).toBeTruthy();
    });
  });

  it("should include a sub (auth0-id)", () => {
    const res = httpMocks.createResponse();
    const req = httpMocks.createRequest({
      method: "GET",
      url: "/",
      headers: {
        authorization: validToken,
      },
    });

    auth(req, res, () => {
      expect(req.user.sub).toBeTruthy();
    });
  });
});
