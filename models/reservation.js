const mongoose = require("mongoose");
const { User } = requie("./user.js");
const Schema = mongoose.Schema;

const ReservationSchema = new Schema({
  user: {
    type: User,
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
});

const Reservation = mongoose.model("Reservation", ReservationSchema);

module.exports = Reservation;
