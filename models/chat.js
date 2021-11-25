const mongoose = require("mongoose");
const { Message } = requie("./message.js");
const { User } = requie("./user.js");
const Schema = mongoose.Schema;

const ChatSchema = new Schema({
  users: { type: [User], required: true },
  messages: { type: [Message] },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const Chat = mongoose.model("Chat", ChatSchema);

module.exports = Chat;
