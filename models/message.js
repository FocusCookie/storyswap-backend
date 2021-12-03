const mongoose = require("mongoose");
const Chat = requie("./chat.js");
const Schema = mongoose.Schema;

const ChatSchema = new Schema({
  chat: {
    type: Chat,
    required: true,
  },
  creatorSub: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  created_at: { type: Date, default: Date.now },
});

const Chat = mongoose.model("Chat", ChatSchema);

module.exports = Chat;
