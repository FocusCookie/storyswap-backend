require("dotenv").config();
const controller = require("../../../controller/offers");

describe("User Controller", () => {
  describe("getUserProfile", () => {
    it("should throw an invalid userSub error if no userSub is given", async () => {
      await expect(controller.getUserProfile()).rejects.toThrow();
    });
  });
});
