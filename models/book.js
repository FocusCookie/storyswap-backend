const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Joi = require("joi");

const BookSchema = new Schema(
  {
    title: { type: String, required: true },
    title_long: { type: String },
    isbn: {
      type: String,
      min: [9, "ISBN needs to be at least 9 chars"],
      max: [10, "ISBN can has max. 10 chars"],
      required: true,
    },
    isbn13: {
      type: String,
      min: [13, "ISBN13 needs to be 13 chars"],
      max: [13, "ISBN13 can has max. 13 chars"],
      required: true,
    },
    dewey_decimal: { type: String },
    binding: { type: String },
    publisher: { type: String },
    language: { type: String },
    date_published: { type: String },
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
  },
  {
    collection: "books",
  }
);

function validate(book) {
  const schema = Joi.object({
    isbn: Joi.string().min(9).max(10),
    isbn13: Joi.string().min(13).max(13),
  });

  return schema.validate(book);
}

const Book = mongoose.model("Book", BookSchema);

module.exports = { Book, validate };
