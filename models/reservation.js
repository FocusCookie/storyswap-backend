const mongoose = require("mongoose");
const UserSchema = require("./user.js");
const Schema = mongoose.Schema;

const ReservationSchema = new Schema(
  {
    collector: {
      type: UserSchema,
      required: true,
    },
    until: {
      type: Date,
      required: true,
    },
    offer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Offer",
      required: true,
    },
    state: {
      type: String,
      enum: ["reserved", "deleted", "pickedup"],
      default: "reserved",
    },
  },
  {
    collection: "reservations",
  }
);

const Reservation = mongoose.model("Reservation", ReservationSchema);

module.exports = Reservation;
