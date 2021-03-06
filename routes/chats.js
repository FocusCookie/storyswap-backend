const express = require("express");
const router = express.Router();
const debug = require("debug")("ROUTES:CHATS");
const chatsController = require("../controller/chats");
const messagesController = require("../controller/messages");
const auth = require("../middleware/auth");
const prettyUser = require("../middleware/prettyUser.js");

router.post("/", auth, prettyUser, async (req, res, next) => {
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

router.get("/my", auth, prettyUser, async (req, res, next) => {
  try {
    const userSub = req.user.sub;
    const chats = await chatsController.getByUserSub(userSub);

    return res.send(chats);
  } catch (error) {
    debug("%s", error);
    next(err);
  }
});

router.get("/sub/:sub", auth, prettyUser, async (req, res, next) => {
  try {
    const userSub = req.user.sub;
    const receiverSub = req.params.sub;

    const usersChats = await chatsController.getByUserSub(userSub);

    const chatWithReceiver = usersChats.filter(
      (chat) =>
        chat.users[0].sub === receiverSub || chat.users[1].sub === receiverSub
    );

    return res.send(
      chatWithReceiver.length !== 0 ? chatWithReceiver[0] : false
    );
  } catch (error) {
    debug("%s", error);
    next(err);
  }
});

router.get("/:id", auth, prettyUser, async (req, res, next) => {
  try {
    const user = req.user;
    const id = req.params.id;

    const chat = await chatsController.getByChatId(id);
    if (chat.users[0].sub !== user.sub && chat.users[1].sub !== user.sub)
      throw {
        status: 403,
        message: "Your are not a member of the chat",
      };

    return res.send(chat);
  } catch (error) {
    debug("%s", error);
    next({ status: 400, message: error.message });
  }
});

router.get("/:id/messages", auth, prettyUser, async (req, res, next) => {
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

router.get("/:id/last-message", auth, prettyUser, async (req, res, next) => {
  try {
    const user = req.user;
    const id = req.params.id;

    const chat = await chatsController.getByChatId(id);
    if (chat.users[0].sub !== user.sub && chat.users[1].sub !== user.sub)
      throw {
        status: 403,
        message: "Your are not a member of the chat",
      };

    const lastMessage = await messagesController.getLasMessageOfChat(id);

    return res.send(lastMessage);
  } catch (error) {
    debug("%s", error);
    next({ status: 400, message: error.message });
  }
});

router.get(
  "/:id/messages/:lastFetchedMessageId",
  auth,
  prettyUser,
  async (req, res, next) => {
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
  }
);

module.exports = router;
