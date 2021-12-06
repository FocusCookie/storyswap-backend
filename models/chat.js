const mongoose = require("mongoose");
const UserSchema = require("./user.js");

const Schema = mongoose.Schema;

const ChatSchema = new Schema(
  {
    users: { type: [UserSchema], required: true },
    created_at: { type: Date, default: Date.now },
  },
  {
    collection: "chats",
  }
);

const Chat = mongoose.model("Chat", ChatSchema);

module.exports = Chat;
