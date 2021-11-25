const error = require("../../../middleware/error");
var httpMocks = require("node-mocks-http");

describe("Error middleware", () => {
  it("should call next if there is no error", () => {
    const next = jest.fn();

    error(false, true, true, next);
    expect(next).toHaveBeenCalled();
  });

  it("Send an status 500 with -something went wrong- if an error is givin without a status", () => {
    const res = httpMocks.createResponse();
    const req = httpMocks.createRequest({
      method: "GET",
      url: "/",
    });

    error(true, req, res);
    expect(res.statusCode).toBe(500);
    expect(res.statusMessage).toBe("something went wrong");
  });

  it("Send an status 500 with the error message from the error ", () => {
    const res = httpMocks.createResponse();
    const req = httpMocks.createRequest({
      method: "GET",
      url: "/",
    });

    const message = "Error-Message";

    error(new Error(message), req, res);
    expect(res.statusCode).toBe(500);
    expect(res.statusMessage).toBe(message);
  });

  it("Send the status and message of the given error ", () => {
    const res = httpMocks.createResponse();
    const req = httpMocks.createRequest({
      method: "GET",
      url: "/",
    });

    const message = "Error-Message";
    const errorWithStatus = new Error(message);
    errorWithStatus.status = 402;

    error(errorWithStatus, req, res);
    expect(res.statusCode).toBe(errorWithStatus.status);
    expect(res.statusMessage).toBe(message);
  });
});
