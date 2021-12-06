require("../../../init/mongodb");
require("dotenv").config();
const config = require("config");
const controller = require("../../../controller/messages");
const chatController = require("../../../controller/chats");
const { MongoClient } = require("mongodb");

describe("Messages Controller", () => {
  let client;
  let db;
  let userA = {
    sub: "auth0|userA",
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

  const mongoObjectId = "61adef63baf93e10f26998a4";

  let chatsInDatabase = [];

  let validMessage;

  beforeAll(async () => {
    client = await MongoClient.connect(config.database.host, {
      useNewUrlParser: true,
    });
    db = await client.db(config.database.name);

    const chat1 = await chatController.create([userA, userB]);
    const chat2 = await chatController.create([userA, userC]);
    const chat3 = await chatController.create([userB, userC]);
    chatsInDatabase.push(chat1);
    chatsInDatabase.push(chat2);
    chatsInDatabase.push(chat3);

    validMessage = {
      chat: chat1._id.toString(),
      creatorSub: userA.sub,
      content: "hello world",
    };
  });

  afterAll(async () => {
    await db.collection("chats").drop();
    await db.collection("messages").drop();
    await client.close();
  });

  describe("Create a message", () => {
    it("should throw an error if no message object is givven", async () => {
      await expect(controller.create()).rejects.toThrow(/invalid message/);
    });

    it("should throw an error if no message object is not an object", async () => {
      await expect(controller.create(true)).rejects.toThrow(/invalid message/);
      await expect(controller.create(123)).rejects.toThrow(/invalid message/);
      await expect(controller.create("foo")).rejects.toThrow(/invalid message/);
      await expect(controller.create([])).rejects.toThrow(/invalid message/);
    });

    it("should throw an error if no chat id is given in the message object", async () => {
      const invalidMessage = {
        creatorSub: validMessage.creatorSub,
        content: validMessage.content,
      };

      await expect(controller.create(invalidMessage)).rejects.toThrow(
        /invalid message/
      );
    });

    it("should throw an error if no user sub is given in the message object", async () => {
      const invalidMessage = {
        chat: validMessage.chat,
        content: validMessage.content,
      };

      await expect(controller.create(invalidMessage)).rejects.toThrow(
        /invalid message/
      );
    });

    it("should throw an error if no content is given in the message object", async () => {
      const invalidMessage = {
        chat: validMessage.chat,
        creatorSub: validMessage.creatorSub,
      };

      await expect(controller.create(invalidMessage)).rejects.toThrow(
        /invalid message/
      );
    });

    it("should return the stored message form the database if the message is valid", async () => {
      const message = await controller.create(validMessage);

      expect(message).toBeTruthy();
      expect(message.chat.toString()).toBe(chatsInDatabase[0]._id.toString());
      expect(message.subCreator).toBe(validMessage.subCreator);
      expect(message.content).toBe(validMessage.content);
    });
  });

  describe("Get messages by chat id", () => {
    beforeAll(async () => {
      for (let i = 0; i < 25; i++) {
        const message = Object.assign({}, validMessage);
        message.chat = chatsInDatabase[1]._id.toString();
        message.content = `message nr. ${i}`;

        if (i >= 20) {
          message.creatorSub = userB.sub;
        }

        await controller.create(message);
      }
    });

    it("should throw an error if no chat id is given", async () => {
      await expect(controller.getByChatId()).rejects.toThrow(/invalid chatId/);
    });

    it("should throw an error if the given chat id is not a valid mongoo db object chatId", async () => {
      await expect(controller.getByChatId(123)).rejects.toThrow(
        /invalid chatId/
      );
      await expect(controller.getByChatId("foo")).rejects.toThrow(
        /invalid chatId/
      );
      await expect(controller.getByChatId(true)).rejects.toThrow(
        /invalid chatId/
      );
      await expect(controller.getByChatId({})).rejects.toThrow(
        /invalid chatId/
      );
      await expect(controller.getByChatId([])).rejects.toThrow(
        /invalid chatId/
      );
    });

    it("should throw an error if the given id is not linked to a chat in the database", async () => {
      await expect(controller.getByChatId(mongoObjectId)).rejects.toThrow(
        /no chat found/gi
      );
    });

    it("should return the last 20 messages from the chat if no lastFetchedMessageId is given", async () => {
      const messages = await controller.getByChatId(
        chatsInDatabase[1]._id.toString()
      );

      expect(messages).toBeTruthy();
      expect(messages.length).toBe(20);
      expect(messages[19].content).toBe("message nr. 19");
    });

    it("should throw an error if the last fetchedMessageId is not a valid mongoo object id", async () => {
      await expect(
        controller.getByChatId(chatsInDatabase[1]._id.toString(), false)
      ).rejects.toThrow(/invalid messageId/);
      await expect(
        controller.getByChatId(chatsInDatabase[1]._id.toString(), "foo")
      ).rejects.toThrow(/invalid messageId/);
      await expect(
        controller.getByChatId(chatsInDatabase[1]._id.toString(), 123)
      ).rejects.toThrow(/invalid messageId/);
      await expect(
        controller.getByChatId(chatsInDatabase[1]._id.toString(), {})
      ).rejects.toThrow(/invalid messageId/);
      await expect(
        controller.getByChatId(chatsInDatabase[1]._id.toString(), [])
      ).rejects.toThrow(/invalid messageId/);
    });

    it("should return 20 messages without lastFetchedMessageId and the second call with the 19th item._id of the first call should return 5 messages ", async () => {
      const messagesPage1 = await controller.getByChatId(
        chatsInDatabase[1]._id.toString()
      );
      const messagesPage2 = await controller.getByChatId(
        chatsInDatabase[1]._id.toString(),
        messagesPage1[19]._id.toString()
      );

      expect(messagesPage1).toBeTruthy();
      expect(messagesPage1.length).toBe(20);
      expect(messagesPage1[19].content).toBe("message nr. 19");

      expect(messagesPage2).toBeTruthy();
      expect(messagesPage2.length).toBe(5);
      expect(messagesPage2[4].content).toBe("message nr. 24");
    });
  });

  describe("Get last message from a chat", () => {
    it("should throw an error if no chat id is given", async () => {
      await expect(controller.getLasMessageOfChat()).rejects.toThrow(
        /invalid chatId/
      );
    });

    it("should throw an error if the given chat id is not a valid mongoo db object chatId", async () => {
      await expect(controller.getLasMessageOfChat(123)).rejects.toThrow(
        /invalid chatId/
      );
      await expect(controller.getLasMessageOfChat("foo")).rejects.toThrow(
        /invalid chatId/
      );
      await expect(controller.getLasMessageOfChat(true)).rejects.toThrow(
        /invalid chatId/
      );
      await expect(controller.getLasMessageOfChat({})).rejects.toThrow(
        /invalid chatId/
      );
      await expect(controller.getLasMessageOfChat([])).rejects.toThrow(
        /invalid chatId/
      );
    });

    it("should throw an error if the given id is not linked to a chat in the database", async () => {
      await expect(
        controller.getLasMessageOfChat(mongoObjectId)
      ).rejects.toThrow(/no chat found/gi);
    });

    it("should return the last message from the selected chat", async () => {
      const message = await controller.getLasMessageOfChat(
        chatsInDatabase[1]._id.toString()
      );

      expect(message).toBeTruthy();
      expect(message.content).toBe("message nr. 24");
    });
  });
});
