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

const OfferSchema = new Schema(
  {
    provider: {
      type: UserSchema,
      required: true,
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    zip: {
      type: Number,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    state: {
      type: String,
      enum: ["pending", "reserved", "deleted", "pickedup"],
      default: "pending",
    },
  },
  {
    collection: "offers",
  }
);

const Offer = mongoose.model("Offer", OfferSchema);

module.exports = Offer;
