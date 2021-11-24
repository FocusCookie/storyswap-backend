const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ExpenseSchema = new Schema({
  provider: {
    type: String,
    required: true,
  },

  dateCreated: {
    type: Date,
    default: Date.now,
  },
  sum: {
    type: Number, // sum will be stored hashed!
    required: true,
  },
  type: {
    type: String,
    enum: ["monthly", "spontaneous"],
    default: "spontaneous",
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  vault: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vault",
    required: true,
  },
  sellingPoint: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SellingPoints",
    required: true,
  },
  // comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comments" }],
  // images: [{ type: mongoose.Schema.Types.ObjectId, ref: "Images" }],
});

const Expense = mongoose.model("Expense", ExpenseSchema);

module.exports = Expense;
