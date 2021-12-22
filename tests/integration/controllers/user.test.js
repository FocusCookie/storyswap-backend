require("dotenv").config();
const config = require("config");
const controller = require("../../../controller/user");

const VALID_USER_SUB = config.user.userSub;

describe("User Controller", () => {
  describe("getUserProfile", () => {
    it("should throw an invalid userSub error if no userSub is given", async () => {
      await expect(controller.getUserProfile()).rejects.toThrow(
        /invalid userSub/gi
      );
    });

    it("should throw an invalid typeError userSub error if the given userSub is not a string", async () => {
      await expect(controller.getUserProfile(123)).rejects.toThrow(
        /invalid userSub/gi
      );
      await expect(controller.getUserProfile(true)).rejects.toThrow(
        /invalid userSub/gi
      );
      await expect(controller.getUserProfile([])).rejects.toThrow(
        /invalid userSub/gi
      );
      await expect(controller.getUserProfile({})).rejects.toThrow(
        /invalid userSub/gi
      );
    });

    it("should return the user profile of an valid userSub", async () => {
      const userprofile = await controller.getUserProfile(VALID_USER_SUB);

      expect(userprofile).toBeTruthy();
      expect(userprofile.nickname).toBe("test");
      expect(userprofile.name).toBe("test@test.de");
    });
  });
  describe("getUserMetadata", () => {
    it("should throw an invalid userSub error if no userSub is given", async () => {
      await expect(controller.getUserMetadata()).rejects.toThrow(
        /invalid userSub/gi
      );
    });

    it("should throw an invalid typeError userSub error if the given userSub is not a string", async () => {
      await expect(controller.getUserMetadata(123)).rejects.toThrow(
        /invalid userSub/gi
      );
      await expect(controller.getUserMetadata(true)).rejects.toThrow(
        /invalid userSub/gi
      );
      await expect(controller.getUserMetadata([])).rejects.toThrow(
        /invalid userSub/gi
      );
      await expect(controller.getUserMetadata({})).rejects.toThrow(
        /invalid userSub/gi
      );
    });

    it("should return the user profile of an valid userSub", async () => {
      const userMetadata = await controller.getUserMetadata(VALID_USER_SUB);

      expect(userMetadata).toBeTruthy();
    });
  });

  describe("updateUserMetadata", () => {
    it("should throw an invalid userSub error if no userSub is given", async () => {
      await expect(controller.updateUserMetadata()).rejects.toThrow(
        /invalid userSub/gi
      );
    });

    it("should throw an invalid typeError userSub error if the given userSub is not a string", async () => {
      await expect(controller.updateUserMetadata(123)).rejects.toThrow(
        /invalid userSub/gi
      );
      await expect(controller.updateUserMetadata(true)).rejects.toThrow(
        /invalid userSub/gi
      );
      await expect(controller.updateUserMetadata([])).rejects.toThrow(
        /invalid userSub/gi
      );
      await expect(controller.updateUserMetadata({})).rejects.toThrow(
        /invalid userSub/gi
      );
    });

    it("should throw an invalid metadata error if no metadata object is given", async () => {
      await expect(
        controller.updateUserMetadata(VALID_USER_SUB)
      ).rejects.toThrow(/invalid metadata/gi);
    });

    it("should throw an invalid metadata error if the given metadata is not an object", async () => {
      await expect(
        controller.updateUserMetadata(VALID_USER_SUB, 123)
      ).rejects.toThrow(/invalid metadata/gi);
      await expect(
        controller.updateUserMetadata(VALID_USER_SUB, "foo")
      ).rejects.toThrow(/invalid metadata/gi);
      await expect(
        controller.updateUserMetadata(VALID_USER_SUB, true)
      ).rejects.toThrow(/invalid metadata/gi);
      await expect(
        controller.updateUserMetadata(VALID_USER_SUB, [])
      ).rejects.toThrow(/invalid metadata/gi);
    });

    it("should return the updated user metadata of an valid userSub", async () => {
      const updatedMetadata = await controller.updateUserMetadata(
        VALID_USER_SUB,
        {
          foo: "bar",
        }
      );

      expect(updatedMetadata).toBeTruthy();
      expect(updatedMetadata.foo).toBe("bar");

      const resetTestMetadata = await controller.updateUserMetadata(
        VALID_USER_SUB,
        {
          foo: null,
        }
      );

      expect(resetTestMetadata).toBeTruthy();
      expect(resetTestMetadata.foo).toBeFalsy();
    });
  });

  describe("updateUser", () => {
    it("should throw an invalid userSub error if no userSub is given", async () => {
      await expect(controller.updateUser()).rejects.toThrow(
        /invalid userSub/gi
      );
    });

    it("should throw an invalid typeError userSub error if the given userSub is not a string", async () => {
      await expect(controller.updateUser(123)).rejects.toThrow(
        /invalid userSub/gi
      );
      await expect(controller.updateUser(true)).rejects.toThrow(
        /invalid userSub/gi
      );
      await expect(controller.updateUser([])).rejects.toThrow(
        /invalid userSub/gi
      );
      await expect(controller.updateUser({})).rejects.toThrow(
        /invalid userSub/gi
      );
    });

    it("should throw an invalid update error if no update object is given", async () => {
      await expect(controller.updateUser(VALID_USER_SUB)).rejects.toThrow(
        /invalid update/gi
      );
    });

    it("should throw an invalid update error if the given update is not an object", async () => {
      await expect(controller.updateUser(VALID_USER_SUB, 123)).rejects.toThrow(
        /invalid update/gi
      );
      await expect(
        controller.updateUser(VALID_USER_SUB, "foo")
      ).rejects.toThrow(/invalid update/gi);
      await expect(controller.updateUser(VALID_USER_SUB, true)).rejects.toThrow(
        /invalid update/gi
      );
      await expect(controller.updateUser(VALID_USER_SUB, [])).rejects.toThrow(
        /invalid update/gi
      );
    });

    it("should return the updated user profile with the given updates included", async () => {
      const defaultUserData = {
        email: "test@test.de",
        name: "test@test.de",
        nickname: "test",
        picture:
          "https://s.gravatar.com/avatar/f84d37ce99493155ee296c2b746191d0?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fte.png",
      };

      const testUpdate = {
        email: "integration@test.de",
        nickname: "nickname-integration",
        name: "name-integration",
        picture:
          "https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png",
      };

      const updatedUser = await controller.updateUser(
        VALID_USER_SUB,
        testUpdate
      );

      expect(updatedUser).toBeTruthy();
      expect(updatedUser.email).toBe(testUpdate.email);
      expect(updatedUser.nickname).toBe(testUpdate.nickname);
      expect(updatedUser.name).toBe(testUpdate.name);
      expect(updatedUser.picture).toBe(testUpdate.picture);

      const resetToDefault = await controller.updateUser(
        VALID_USER_SUB,
        defaultUserData
      );

      expect(resetToDefault).toBeTruthy();
      expect(resetToDefault.email).toBe(defaultUserData.email);
      expect(resetToDefault.nickname).toBe(defaultUserData.nickname);
      expect(resetToDefault.name).toBe(defaultUserData.name);
      expect(resetToDefault.picture).toBe(defaultUserData.picture);
    });
  });
});
