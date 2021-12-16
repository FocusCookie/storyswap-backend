const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostalcodeSchema = new Schema(
  {
    coordinates: { type: [Number], required: true },
    city: { type: String, required: true },
    zip: {
      type: Number,
      min: [10000, "zip needs to be 5 digits"],
      max: [99999, "zip needs to be 5 digits"],
      required: true,
    },
  },
  {
    collection: "postalcodes",
  }
);

const Postalcode = mongoose.model("Postalcode", PostalcodeSchema);

module.exports = { Postalcode, PostalcodeSchema };
