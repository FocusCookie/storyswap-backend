const debug = require("debug")("CONTROLLER:CHAT");
const Chat = require("../models/chat");
const mongoose = require("mongoose");

module.exports.create = async function (users) {
  try {
    if (
      !Array.isArray(users) ||
      users.length > 2 ||
      typeof users[0] !== "object" ||
      typeof users[1] !== "object" ||
      Array.isArray(users[0]) ||
      Array.isArray(users[1]) ||
      !users[0].sub ||
      !users[0].nickname ||
      !users[1].sub ||
      !users[1].nickname
    )
      throw new Error("invalid users");

    const chatExistsAlready = await Chat.findOne({
      $and: [
        {
          users: { $elemMatch: { sub: users[0].sub } },
        },
        {
          users: { $elemMatch: { sub: users[1].sub } },
        },
      ],
    });

    if (chatExistsAlready) return chatExistsAlready;

    const chat = new Chat({ users: users });

    const createdChat = await chat.save();

    return createdChat;
  } catch (error) {
    debug("%s", error);
    throw new Error(error);
  }
};

module.exports.getByChatId = async function (id) {
  try {
    if (!id || typeof id === "number") throw new Error("invalid chat id");

    const idIsValid = mongoose.Types.ObjectId.isValid(id);
    if (!idIsValid) throw new Error("invalid chat id");

    const chat = await Chat.findOne({ _id: id });

    if (!chat) throw new Error("No chat found with id: ", id);

    return chat;
  } catch (error) {
    debug("%s", error);
    throw new Error(error);
  }
};

module.exports.getByUserSub = async function (sub) {
  try {
    if (!sub || typeof sub !== "string") throw new Error("invalid user sub");

    const chats = await Chat.find({
      users: { $elemMatch: { sub: sub } },
    }).sort({ created_at: "desc" });

    if (chats.length === 0) return [];

    return chats;
  } catch (error) {
    debug("%s", error);
    throw new Error(error);
  }
};

module.exports.delete = async function (id) {
  try {
    if (!id || typeof id === "number") throw new Error("invalid id");

    const idIsValid = mongoose.Types.ObjectId.isValid(id);
    if (!idIsValid) throw new Error("invalid id");

    const chat = await Chat.findOne({ _id: id });

    if (!chat) throw new Error("No chat found with id: ", id);

    const deleted = await Chat.deleteOne({ _id: id });

    return deleted;
  } catch (error) {
    debug("%s", error);
    throw new Error(error);
  }
};
