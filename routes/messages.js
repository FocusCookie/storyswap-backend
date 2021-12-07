const express = require("express");
const router = express.Router();
const debug = require("debug")("ROUTES:MESSAGES");
const chatsController = require("../controller/chats");
const messagesController = require("../controller/messages");

router.post("/", async (req, res, next) => {
  try {
    const userSub = req.user.sub;
    const { content, chat } = req.body;

    if (!content || !chat) throw { status: 400, message: "invalid message" };

    const message = { content, chat, creatorSub: userSub };

    const chatInDatabase = await chatsController.getByChatId(chat);
    if (
      chatInDatabase.users[0].sub !== userSub &&
      chatInDatabase.users[1].sub !== userSub
    )
      throw {
        status: 403,
        message: "Your are not a member of the chat",
      };

    const createdMessage = await messagesController.create(message);

    return res.send(createdMessage);
  } catch (error) {
    debug("%s", error);
    next({ status: error.status ? error.status : 400, message: error.message });
  }
});

module.exports = router;
