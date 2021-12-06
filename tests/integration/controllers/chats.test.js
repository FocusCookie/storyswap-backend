require("../../../init/mongodb");
require("dotenv").config();
const config = require("config");
const controller = require("../../../controller/chats");
const Chat = require("../../../models/chat");
const { MongoClient } = require("mongodb");

describe("Chat Controller", () => {
  let client;
  let db;
  let userA = {
    sub: "auth0-init|userA",
    nickname: "User A",
    picture: "https://source.unsplash.com/random/200x200",
  };
  let userB = {
    sub: "auth0-init|userB",
    nickname: "User B",
    picture: "https://source.unsplash.com/random/200x200",
  };
  let userC = {
    sub: "auth0|userC",
    nickname: "User C",
    picture: "https://source.unsplash.com/random/200x200",
  };
  let chatsInDatabase = [];

  beforeAll(async () => {
    client = await MongoClient.connect(config.database.host, {
      useNewUrlParser: true,
    });
    db = await client.db(config.database.name);
    const testChat = new Chat({ users: [userA, userB] });
    await testChat.save();
  });

  afterAll(async () => {
    await db.collection("chats").drop();
    await client.close();
  });

  describe("Create a chat", () => {
    beforeEach(() => {
      userA = {
        sub: "auth0|userA",
        nickname: "User A",
        picture: "https://source.unsplash.com/random/200x200",
      };
      userB = {
        sub: "auth0|userB",
        nickname: "User B",
        picture: "https://source.unsplash.com/random/200x200",
      };
    });

    it("should throw an error if no users where given", async () => {
      await expect(controller.create()).rejects.toThrow(/invalid users/);
    });

    it("should throw an error if the given users array is longer than 2 users", async () => {
      await expect(controller.create([userA, userB, userA])).rejects.toThrow(
        /invalid users/
      );
    });

    it("should throw an error if the given users are not an Object", async () => {
      await expect(controller.create([1, 2])).rejects.toThrow(/invalid users/);

      await expect(controller.create([true, false])).rejects.toThrow(
        /invalid users/
      );

      await expect(controller.create(["foo", "bar"])).rejects.toThrow(
        /invalid users/
      );

      await expect(controller.create([[1], [2]])).rejects.toThrow(
        /invalid users/
      );
    });

    it("should throw an error if the given users do not have the props sub and nickname", async () => {
      await expect(controller.create([{}, { name: "foo" }])).rejects.toThrow(
        /invalid users/
      );
    });

    it("should return a chat if the users are valid", async () => {
      userA.sub = "auth0-create|userA";
      const chat = await controller.create([userA, userB]);

      expect(chat).toBeTruthy();
      expect(chat.users.length).toBe(2);
      expect(chat.users[0].sub).toBe(userA.sub);
      expect(chat.users[1].sub).toBe(userB.sub);
    });
  });

  describe("Get chat by chat id", () => {
    beforeAll(async () => {
      userA = {
        sub: "auth0|userA",
        nickname: "User A",
        picture: "https://source.unsplash.com/random/200x200",
      };
      userB = {
        sub: "auth0|userB",
        nickname: "User B",
        picture: "https://source.unsplash.com/random/200x200",
      };
      userC = {
        sub: "auth0|userC",
        nickname: "User C",
        picture: "https://source.unsplash.com/random/200x200",
      };

      // Create chats between: a & b, a & c, b & c
      const chat1 = await controller.create([userA, userB]);
      const chat2 = await controller.create([userA, userC]);
      const chat3 = await controller.create([userB, userC]);
      chatsInDatabase.push(chat1);
      chatsInDatabase.push(chat2);
      chatsInDatabase.push(chat3);
    });

    it("should throw an error if no chat id is given", async () => {
      await expect(controller.getByChatId()).rejects.toThrow(/invalid chat id/);
    });

    it("should throw an error if the given id is not an mongo object id", async () => {
      await expect(controller.getByChatId("foo")).rejects.toThrow(
        /invalid chat id/
      );
      await expect(controller.getByChatId(123)).rejects.toThrow(
        /invalid chat id/
      );
      await expect(controller.getByChatId(true)).rejects.toThrow(
        /invalid chat id/
      );
      await expect(controller.getByChatId([])).rejects.toThrow(
        /invalid chat id/
      );
      await expect(controller.getByChatId({})).rejects.toThrow(
        /invalid chat id/
      );
    });

    it("should throw an error the given id is not linked to a chat in the database", async () => {
      const mongoObjectId = "61ae0c282a3988e063b4ff4e";

      await expect(controller.getByChatId(mongoObjectId)).rejects.toThrow(
        /no chat found/gi
      );
    });

    it("should return the chat with the given id", async () => {
      const chat = await controller.getByChatId(
        chatsInDatabase[0]._id.toString()
      );

      expect(chat).toBeTruthy();
      expect(chat.users.length).toBe(2);
      expect(chat._id.toString()).toBe(chatsInDatabase[0]._id.toString());
      expect(chat.users[0].sub).toBe(chatsInDatabase[0].users[0].sub);
      expect(chat.users[1].sub).toBe(chatsInDatabase[0].users[1].sub);
    });
  });

  describe("Get chat by user sub", () => {
    beforeAll(async () => {
      userA = {
        sub: "auth0|userA",
        nickname: "User A",
        picture: "https://source.unsplash.com/random/200x200",
      };
      userB = {
        sub: "auth0|userB",
        nickname: "User B",
        picture: "https://source.unsplash.com/random/200x200",
      };
      userC = {
        sub: "auth0|userC",
        nickname: "User C",
        picture: "https://source.unsplash.com/random/200x200",
      };
    });

    it("should throw an error if user sub is given", async () => {
      await expect(controller.getByUserSub()).rejects.toThrow(
        /invalid user sub/
      );
    });

    it("should throw an error if user sub not an string", async () => {
      await expect(controller.getByUserSub()).rejects.toThrow(
        /invalid user sub/
      );
      await expect(controller.getByUserSub(123)).rejects.toThrow(
        /invalid user sub/
      );
      await expect(controller.getByUserSub([])).rejects.toThrow(
        /invalid user sub/
      );
      await expect(controller.getByUserSub({})).rejects.toThrow(
        /invalid user sub/
      );
      await expect(controller.getByUserSub(true)).rejects.toThrow(
        /invalid user sub/
      );
    });

    it("should throw an error if the given user sub is not accosiated with a chat", async () => {
      await expect(controller.getByUserSub("auth0|user99")).rejects.toThrow(
        /no chat found/gi
      );
    });

    it("should return all the chats where userA is involved (2) ", async () => {
      const chatsFromUserA = await controller.getByUserSub(userA.sub);

      expect(chatsFromUserA).toBeTruthy();
      expect(
        chatsFromUserA[0].users.find((user) => user.sub === userA.sub)
      ).toBeTruthy();
      expect(
        chatsFromUserA[1].users.find((user) => user.sub === userA.sub)
      ).toBeTruthy();
      expect(chatsFromUserA.length).toBe(2);
    });

    it("should return all the chats where userC is involved (2) ", async () => {
      const chatsFromUserC = await controller.getByUserSub(userA.sub);

      expect(chatsFromUserC).toBeTruthy();
      expect(
        chatsFromUserC[0].users.find((user) => user.sub === userA.sub)
      ).toBeTruthy();
      expect(
        chatsFromUserC[1].users.find((user) => user.sub === userA.sub)
      ).toBeTruthy();
      expect(chatsFromUserC.length).toBe(2);
    });
  });

  describe("Delete a chat by chat id ", () => {
    it("should throw an error if no chat id is given", async () => {
      await expect(controller.delete()).rejects.toThrow(/invalid id/);
    });

    it("should throw an error if the given id is not a valid mongoo object id", async () => {
      await expect(controller.delete(123)).rejects.toThrow(/invalid id/);
      await expect(controller.delete("foo")).rejects.toThrow(/invalid id/);
      await expect(controller.delete(true)).rejects.toThrow(/invalid id/);
      await expect(controller.delete([])).rejects.toThrow(/invalid id/);
      await expect(controller.delete({})).rejects.toThrow(/invalid id/);
    });

    it("should throw an error the given id is not linked to a chat in the database", async () => {
      const mongoObjectId = "61ae0c282a3988e063b4ff4e";
      await expect(controller.delete(mongoObjectId)).rejects.toThrow(
        /no chat found/gi
      );
    });

    it("should return an delete object if the given chat is deleted successfully", async () => {
      const deleted = await controller.delete(
        chatsInDatabase[0]._id.toString()
      );

      expect(deleted).toBeTruthy();
      expect(deleted.deletedCount).toBe(1);
    });
  });
});
