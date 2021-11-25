const mongoose = require("mongoose");
const { User } = requie("./user.js");
const Schema = mongoose.Schema;

const OfferSchema = new Schema({
  provider: {
    type: User,
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
});

const Offer = mongoose.model("Offer", OfferSchema);

module.exports = Expense;
