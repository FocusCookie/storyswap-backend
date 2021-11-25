const mongoose = require("mongoose");
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

const User = mongoose.model("User", UserSchema);

module.exports = User;
