const mongoose = require("mongoose");
const Message = requie("./message.js");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  sub: {
    type: String,
    required: true,
  },
  nickname: {
    type: String,
    required: true,
  },
  picture: {
    type: String,
  },
});

const ChatSchema = new Schema({
  users: { type: [UserSchema], required: true },
  messages: { type: [Message] },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const Chat = mongoose.model("Chat", ChatSchema);

module.exports = Chat;
