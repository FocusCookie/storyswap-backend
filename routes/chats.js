const express = require("express");
const router = express.Router();
const debug = require("debug")("ROUTES:CHATS");
const chatsController = require("../controller/chats");
const messagesController = require("../controller/messages");

router.post("/", async (req, res, next) => {
  try {
    const sender = req.user;
    const receiver = req.body.receiver;

    if (!receiver) throw { status: 400, message: "invalid receiver" };

    const chat = await chatsController.create([sender, receiver]);

    res.send(chat);
  } catch (error) {
    debug("%s", error);
    next(error);
  }
});

router.get("/my", async (req, res, next) => {
  try {
    const userSub = req.user.sub;
    const chats = await chatsController.getByUserSub(userSub);

    return res.send(chats);
  } catch (error) {
    debug("%s", error);
    next(err);
  }
});

router.get("/:id/messages", async (req, res, next) => {
  try {
    const user = req.user;
    const id = req.params.id;

    const chat = await chatsController.getByChatId(id);
    if (chat.users[0].sub !== user.sub && chat.users[1].sub !== user.sub)
      throw {
        status: 403,
        message: "Your are not a member of the chat",
      };

    const messages = await messagesController.getByChatId(id);

    return res.send(messages);
  } catch (error) {
    debug("%s", error);
    next({ status: 400, message: error.message });
  }
});

router.get("/:id/messages/:lastFetchedMessageId", async (req, res, next) => {
  try {
    const user = req.user;
    const id = req.params.id;
    const lastFetchedMessageId = req.params.lastFetchedMessageId;

    const chat = await chatsController.getByChatId(id);
    if (chat.users[0].sub !== user.sub && chat.users[1].sub !== user.sub)
      throw {
        status: 403,
        message: "Your are not a member of the chat",
      };

    const messages = await messagesController.getByChatId(
      id,
      lastFetchedMessageId
    );

    return res.send(messages);
  } catch (error) {
    debug("%s", error);
    next({ status: 400, message: error.message });
  }
});

module.exports = router;
