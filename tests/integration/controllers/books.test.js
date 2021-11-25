require("dotenv").config();
const config = require("config");
const controller = require("../../../controller/books");
const axios = require("axios");
jest.mock("axios");

const { MongoClient } = require("mongodb");

describe("Book Controller", () => {
  let client;
  let db;

  beforeAll(async () => {
    client = await MongoClient.connect(config.database.host, {
      useNewUrlParser: true,
    });
    db = await client.db(config.database.name);
  });

  afterAll(async () => {
    await db.collection("books").drop();
    await client.close();
  });

  describe("Create a book", () => {
    it("should throw an error if no book is given", async () => {
      await expect(controller.create()).rejects.toThrow();
    });

    it("should not call the api if the book is already in the database", async () => {
      expect(axios.get).not.toHaveBeenCalled();
    });

    it("should should call the api if the book is not in the database and store it in the database", () => {
      expect(axios.get).toHaveBeenCalled();
      axios.get.mockResolvedValue({
        data: {
          book: {
            publisher: "Carlsen Verlag Gmbtl",
            language: "en_US",
            image: "https://images.isbndb.com/covers/16/72/9783551551672.jpg",
            title_long: "Harry Potter und der Stein der Weisen",
            edition: "Cloth First Published 1989 ed.",
            dimensions:
              "Height: 8.5 Inches, Length: 5.5 Inches, Weight: 1.05 Pounds, Width: 1.25 Inches",
            pages: 335,
            date_published: "1999-12-01T00:00:01Z",
            authors: ["J. K. Rowling"],
            title: "Harry Potter und der Stein der Weisen",
            isbn13: "9783551551672",
            msrp: "43.95",
            binding: "Hardcover",
            isbn: "3551551677",
          },
        },
      });
    });

    // SAVE from jest as example
    it("Jest example", async () => {
      const books = db.collection("books");

      const mockUser = { _id: "123", name: "Mr Test" };
      await books.insertOne(mockUser);

      const insertedUser = await books.findOne({ _id: "123" });
      expect(insertedUser).toEqual(mockUser);
    });
  });
});
