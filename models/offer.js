const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const UserSchema = require("./user.js");

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
    reservation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reservation",
    },
  },
  {
    collection: "offers",
  }
);

const Offer = mongoose.model("Offer", OfferSchema);

module.exports = Offer;
