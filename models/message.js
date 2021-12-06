const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MessageSchema = new Schema(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
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
  },
  {
    collection: "messages",
  }
);

const Message = mongoose.model("Message", MessageSchema);
module.exports = Message;
