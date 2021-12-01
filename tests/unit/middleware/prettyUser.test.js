const prettyUser = require("../../../middleware/prettyUser");
var httpMocks = require("node-mocks-http");
require("dotenv").config();
const config = require("config");

const user = {
  "https://api.storyswap.app/picture":
    "https://source.unsplash.com/200x200/?potrait",
  "https://api.storyswap.app/roles": ["user"],
  "https://api.storyswap.app/nickname": "Tester",
  sub: "google-oauth2|tester",
};

describe("prettyUser", () => {
  it("should call next if no user is attached to req", () => {
    const host = "localhost";
    const req = httpMocks.createRequest({
      method: "GET",
      url: "/",
      hostname: host,
    });

    const next = jest.fn();
    const res = jest.fn();

    prettyUser(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("should prettify the user if a user is attached to the req", () => {
    const host = "localhost";
    const req = httpMocks.createRequest({
      method: "GET",
      url: "/",
      hostname: host,
    });
    req.user = Object.assign({}, user);

    const next = jest.fn();
    const res = jest.fn();

    prettyUser(req, res, next);

    expect(req.user.nickname).toBe(user["https://api.storyswap.app/nickname"]);
    expect(req.user.roles[0]).toBe(user["https://api.storyswap.app/roles"][0]);
    expect(req.user.picture).toBe(user["https://api.storyswap.app/picture"]);
  });
});
