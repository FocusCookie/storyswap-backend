const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BookSchema = new Schema({
  title: { type: String },
  title_long: { type: String },
  isbn: { type: String },
  isbn13: { type: String },
  dewey_decimal: { type: String },
  binding: { type: String },
  publisher: { type: String },
  language: { type: String },
  date_published: { type: Date },
  edition: { type: String },
  pages: { type: Number },
  dimensions: { type: String },
  overview: { type: String },
  image: { type: String },
  msrp: { type: Number },
  excerpt: { type: String },
  synopsys: { type: String },
  authors: [String],
  subjects: [String],
  reviews: [String],
  prices: [
    {
      condition: { type: String },
      merchant: { type: String },
      merchant_logo: { type: String },
      merchant_logo_offset: {
        x: { type: String },
        y: { type: String },
      },
      shipping: { type: String },
      price: { type: String },
      total: { type: String },
      link: { type: String },
    },
  ],
  related: {
    type: { type: String },
  },
});

const Book = mongoose.model("Book", BookSchema);

module.exports = Book;
