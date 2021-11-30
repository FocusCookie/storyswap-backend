require("../../../init/mongodb");
require("dotenv").config();
const config = require("config");
const controller = require("../../../controller/offers");
const bookController = require("../../../controller/books");
const Offer = require("../../../models/offer");
const { MongoClient } = require("mongodb");

const testBook = {
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
};

describe("Offers Controller", () => {
  let client;
  let db;
  let offer;
  let bookInDatabase;

  beforeAll(async () => {
    client = await MongoClient.connect(config.database.host, {
      useNewUrlParser: true,
    });
    db = await client.db(config.database.name);
    offersCollection = db.collection("offers");

    bookInDatabase = await bookController.createBookInDatabase(testBook);
  });

  afterAll(async () => {
    await db.collection("books").drop();
    await db.collection("offers").drop();
    await client.close();
  });

  describe("Create an offer", () => {
    beforeEach(() => {
      offer = {
        provider: {
          sub: "auth0|idstring",
          nickname: "Mr. Test",
          picture: "picture-url",
        },
        book: bookInDatabase._id.toString(),
        zip: 10409,
        city: "Berlin",
      };
    });

    it("should throw an error if no offer was given", async () => {
      await expect(controller.create()).rejects.toThrow();
    });

    it("should throw an error if the offer is not an object", async () => {
      await expect(controller.create([])).rejects.toThrow();
      await expect(controller.create("offer")).rejects.toThrow();
      await expect(controller.create(123)).rejects.toThrow();
      await expect(controller.create(true)).rejects.toThrow();
    });

    it("should throw an error if the provider is mising in the given offer", async () => {
      delete offer.provider;
      await expect(controller.create(offer)).rejects.toThrowError(/provider/);
    });

    it("should throw an error if the book is mising in the given offer", async () => {
      delete offer.book;
      await expect(controller.create(offer)).rejects.toThrowError(/book/);
    });

    it("should throw an error if the zip is mising in the given offer", async () => {
      delete offer.zip;
      await expect(controller.create(offer)).rejects.toThrowError(/zip/);
    });

    it("should throw an error if the city is mising in the given offer", async () => {
      delete offer.city;
      await expect(controller.create(offer)).rejects.toThrowError(/city/);
    });

    describe("Provider check", () => {
      it("should throw an error if the sub of the given provider is missing", async () => {
        delete offer.provider.sub;
        await expect(controller.create(offer)).rejects.toThrowError(/sub/);
      });

      it("should throw an error if the nickname of the given provider is missing", async () => {
        delete offer.provider.nickname;
        await expect(controller.create(offer)).rejects.toThrowError(/nickname/);
      });
    });

    it("should return a valid database offer if the given offer object is valid", async () => {
      const createdOffer = await controller.create(offer);

      expect(createdOffer).toBeTruthy();
      expect(createdOffer._id).toBeTruthy();
      expect(createdOffer.provider.nickname).toBe(offer.provider.nickname);
      expect(createdOffer.zip).toBe(offer.zip);
      expect(createdOffer.book.toString()).toBe(offer.book);
    });
  });

  describe("Update an offer", () => {
    let offerInDatabase;
    beforeAll(async () => {
      offerInDatabase = await controller.create(offer);
    });

    beforeEach(() => {
      offer = {
        provider: {
          sub: "auth0|idstring",
          nickname: "Mr. Test",
          picture: "picture-url",
        },
        book: bookInDatabase._id.toString(),
        zip: 10409,
        city: "Berlin",
      };
    });

    it("should throw an error if no id and offer was given", async () => {
      await expect(controller.update()).rejects.toThrow();
    });

    it("should throw an error if the id is valid and no update was given", async () => {
      await expect(
        controller.update(offerInDatabase._id.toString())
      ).rejects.toThrow();
    });

    it("should throw an error if given offer has not one valid property of book, zip, city or state", async () => {
      await expect(
        controller.update(offerInDatabase._id.toString(), { foo: "bar" })
      ).rejects.toThrow();
    });

    it("should throw an error if the given id is not used in the database", async () => {
      await expect(
        controller.update("61a5f36ea4d4a83ffda71694", offer)
      ).rejects.toThrow(/No offer found with id/gi);
    });

    it("should throw an error if the given update is not valid with the model", async () => {
      const update = { city: 123 };

      await expect(
        controller.update(offerInDatabase._id.toString(), update)
      ).rejects.toThrow(/invalid offer update/gi);
    });

    it("should update the offer with the given update", async () => {
      const update = { city: "Hamburg" };
      const updatedOffer = await controller.update(
        offerInDatabase._id.toString(),
        update
      );
      expect(updatedOffer.city).toBe(update.city);
    });
  });

  it.todo("get offers as new group ...");
});
