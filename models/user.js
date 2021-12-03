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

module.exports = UserSchema;
