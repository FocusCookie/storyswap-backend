const debug = require("debug")("CONTROLLER:MESSAGES");
const Message = require("../models/message");
const Chat = require("../models/chat");
const mongoose = require("mongoose");

const ITEMS_PER_PAGE = 20;

module.exports.create = async function (message) {
  try {
    if (!message || typeof message !== "object" || Array.isArray(message))
      throw new Error("invalid message");

    const newMessage = new Message(message);

    const validatedMessage = newMessage.validateSync();
    const validationErrors = validatedMessage
      ? Object.values(validatedMessage.errors).map((err) => err.message)
      : null;

    if (validationErrors) {
      throw new Error(`invalid message - ${validationErrors.join(" - ")}`);
    }

    const savedMessage = await newMessage.save();

    return savedMessage;
  } catch (error) {
    debug("%s", error);
    throw new Error(error);
  }
};

module.exports.getByChatId = async function (chatId, lastFetchedMessageId) {
  try {
    if (!chatId || typeof chatId === "number")
      throw new Error("invalid chatId");

    const chatIdIsValid = mongoose.Types.ObjectId.isValid(chatId);
    if (!chatIdIsValid) throw new Error("invalid chatId");

    const chat = await Chat.findOne({ _id: chatId });
    if (!chat) throw new Error("No chat found with chatId: ", chatId);

    let messages;

    if (typeof lastFetchedMessageId === "number")
      throw new Error("invalid messageId");
    if (lastFetchedMessageId !== undefined) {
      const messageIdIsValid =
        mongoose.Types.ObjectId.isValid(lastFetchedMessageId);
      if (!messageIdIsValid) throw new Error("invalid messageId");
    }

    if (lastFetchedMessageId) {
      messages = await Message.find({
        chat: chatId,
        _id: { $gt: lastFetchedMessageId.toString() },
      }).limit(ITEMS_PER_PAGE);
    } else {
      messages = await Message.find({ chat: chatId }).limit(ITEMS_PER_PAGE);
    }

    return messages;
  } catch (error) {
    debug("%s", error);
    throw new Error(error);
  }
};

module.exports.getLasMessageOfChat = async function (chatId) {
  try {
    if (!chatId || typeof chatId === "number")
      throw new Error("invalid chatId");

    const chatIdIsValid = mongoose.Types.ObjectId.isValid(chatId);
    if (!chatIdIsValid) throw new Error("invalid chatId");

    const chat = await Chat.findOne({ _id: chatId });
    if (!chat) throw new Error("No chat found with chatId: ", chatId);

    message = await Message.findOne().sort({ created_at: -1 }).limit(1);

    return message;
  } catch (error) {
    debug("%s", error);
    throw new Error(error);
  }
};
