require("../../../init/mongodb");
require("dotenv").config();
const config = require("config");
const controller = require("../../../controller/offers");
const bookController = require("../../../controller/books");
const bookHelper = require("../../../helpers/books");
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

    it("should update the offer city with the given update city", async () => {
      const update = { city: "Hamburg" };
      const updatedOffer = await controller.update(
        offerInDatabase._id.toString(),
        update
      );
      expect(updatedOffer.city).toBe(update.city);
    });
  });

  describe("Get offers", () => {
    let bookInDatabase;
    beforeAll(async () => {
      //* create some books in the database to have valid book ids
      const createBooksPromises = [];
      bookHelper.books.forEach((book) => {
        createBooksPromises.push(bookController.createBookInDatabase(book));
      });
      const books = await Promise.all(createBooksPromises);

      bookInDatabase = books[0];

      //* create some offers in the database to work with
      const createOffersPromises = books.map((book, index) => {
        const offer = {
          provider: {
            sub: "auth0|idstring" + index,
            nickname: "Mr. Test the " + index,
            picture: "picture-url",
          },
          book: "id",
          zip: 10000 + index,
          city: "Berlin",
        };

        offer.book = book._id.toString();

        return controller.create(offer);
      });

      const offersInDatabase = await Promise.all(createOffersPromises);

      await controller.update(offersInDatabase[0], { state: "reserved" });
      await controller.update(offersInDatabase[1], { state: "pickedup" });
      await controller.update(offersInDatabase[2], { state: "deleted" });
      await controller.update(offersInDatabase[3], { city: "New York" });
    });

    it("should return the latest ten offers from the offers collection if no filter was applied", async () => {
      const offers = await controller.get();

      expect(offers.length).toBe(10);
    });

    describe("Filter", () => {
      it("should return one offer with the validBookIdInDatabase", async () => {
        const offers = await controller.get({
          book: bookInDatabase._id.toString(),
        });

        expect(offers.length).toBe(1);
        expect(offers[0].book._id.toString()).toBe(
          bookInDatabase._id.toString()
        );
      });

      it("should return one offer with state reserved", async () => {
        const offers = await controller.get({
          state: "reserved",
        });

        expect(offers.length).toBe(1);
      });

      it("should return one offer with state deleted", async () => {
        const offers = await controller.get({
          state: "deleted",
        });

        expect(offers.length).toBe(1);
      });

      it("should return one offer with state pickedup", async () => {
        const offers = await controller.get({
          state: "pickedup",
        });

        expect(offers.length).toBe(1);
      });

      it("should return one offer with city New York", async () => {
        const offers = await controller.get({
          city: "New York",
        });

        expect(offers.length).toBe(1);
      });

      it("should return one offer with given provider sub", async () => {
        const sub = "auth0|idstring0";

        const offers = await controller.get({
          provider: { sub: sub },
        });

        expect(offers.length).toBe(1);
        expect(offers[0].provider.sub).toBe(sub);
      });
    });

    describe("Pagination", () => {
      it("should return first 10 books and than another page with 10 items if the 10th book was passed as lastFetchedOfferId into the second call", async () => {
        const firstPage = await controller.get();
        const secondPage = await controller.get(null, firstPage[9]._id);

        expect(firstPage.length).toBe(10);
        expect(secondPage.length).toBe(10);
      });

      it("should return one offer even if the lastFetchedItemId is the locked up one with the filter, if there is less matches than 10 items", async () => {
        const offers = await controller.get(
          {
            book: bookInDatabase._id.toString(),
          },
          bookInDatabase._id.toString()
        );

        expect(offers.length).toBe(1);
        expect(offers[0].book._id.toString()).toBe(
          bookInDatabase._id.toString()
        );
      });
    });
  });

  describe("Get offer by id", () => {
    let bookInDatabase;
    let offersInDatabase;
    beforeAll(async () => {
      //* create some books in the database to have valid book ids
      const createBooksPromises = [];
      bookHelper.books.forEach((book) => {
        createBooksPromises.push(bookController.createBookInDatabase(book));
      });
      const books = await Promise.all(createBooksPromises);

      bookInDatabase = books[0];

      //* create some offers in the database to work with
      const createOffersPromises = books.map((book, index) => {
        const offer = {
          provider: {
            sub: "auth0|idstring" + index,
            nickname: "Mr. Test the " + index,
            picture: "picture-url",
          },
          book: "id",
          zip: 10000 + index,
          city: "Berlin",
        };

        offer.book = book._id.toString();

        return controller.create(offer);
      });

      offersInDatabase = await Promise.all(createOffersPromises);

      await controller.update(offersInDatabase[0], { state: "reserved" });
      await controller.update(offersInDatabase[1], { state: "pickedup" });
      await controller.update(offersInDatabase[2], { state: "deleted" });
      await controller.update(offersInDatabase[3], { city: "New York" });
    });

    it("should throw an error if no id was given", async () => {
      await expect(controller.getById()).rejects.toThrow();
    });

    it("should throw an invalid offer id error if given id is not a string or number", async () => {
      await expect(controller.getById([])).rejects.toThrow();
      await expect(controller.getById({})).rejects.toThrow();
      await expect(controller.getById(true)).rejects.toThrow();
    });

    it("should throw an invalid offer id error if given id is not a valid object id", async () => {
      await expect(controller.getById("hello world")).rejects.toThrow();
      await expect(controller.getById("123")).rejects.toThrow();
    });

    it("should return a offer from the database if the given id is valid", async () => {
      const offers = await controller.get();

      const selectedOfferToCheck = offers[0];

      const offer = await controller.getById(
        selectedOfferToCheck._id.toString()
      );

      expect(selectedOfferToCheck._id).toEqual(offer._id);
    });
  });

  describe("Get my offers (user offers)", () => {
    let booksInDatabase;
    let offersInDatabase;
    const validUser = {
      sub: "auth0|test",
      nickname: "Mr. Test",
      picture: "picture-url",
    };

    beforeAll(async () => {
      //* create some books in the database to have valid book ids
      const createBooksPromises = [];
      bookHelper.books.forEach((book) => {
        createBooksPromises.push(bookController.createBookInDatabase(book));
      });

      booksInDatabase = await Promise.all(createBooksPromises);

      //* create some offers in the database to work with
      const createOffersPromises = booksInDatabase.map((book, index) => {
        let state = "pending";

        if (index >= 10 && index < 15) state = "pickedup";
        if (index >= 15 && index < 20) state = "reserved";
        if (index >= 20) state = "deleted";

        const offer = {
          provider: validUser,
          book: book._id.toString(),
          zip: 10000 + index,
          city: "Berlin",
          state: state,
        };

        offer.book = book._id.toString();

        return controller.create(offer);
      });

      offersInDatabase = await Promise.all(createOffersPromises);
    });

    it("should throw an error if no user is given", async () => {
      await expect(controller.getByUser()).rejects.toThrow(/invalid user/gi);
    });

    it("should throw an error the user is not an object", async () => {
      await expect(controller.getByUser(1)).rejects.toThrow(/invalid user/gi);
      await expect(controller.getByUser(true)).rejects.toThrow(
        /invalid user/gi
      );
      await expect(controller.getByUser([])).rejects.toThrow(/invalid user/gi);
      await expect(controller.getByUser("user")).rejects.toThrow(
        /invalid user/gi
      );
    });

    it("should throw an error if the given user has no sub property", async () => {
      const invalidUser = {
        nickname: validUser.nickname,
        picture: validUser.picture,
      };
      await expect(controller.getByUser(invalidUser)).rejects.toThrow(
        /invalid user/gi
      );
    });

    it("should return an empty array if no offer is accossiated with the user", async () => {
      const userWithoutOffers = {
        sub: "auth0|noOffers",
        nickname: "no offers",
        picture: "pic",
      };

      const offers = await controller.getByUser(userWithoutOffers);

      expect(offers).toBeTruthy();
      expect(offers.length).toBe(0);
    });

    it("should return 20 offer in total where 10 offers are state pending, 5 are  reserved and 5 with  pickedup for the validUser", async () => {
      const offers = await controller.getByUser(validUser);

      const pending = offers.filter((offer) => offer.state === "pending");
      const reserved = offers.filter((offer) => offer.state === "reserved");
      const pickedup = offers.filter((offer) => offer.state === "pickedup");

      expect(offers).toBeTruthy();
      expect(offers.length).toBe(20);

      expect(pending.length).toBe(10);
      expect(reserved.length).toBe(5);
      expect(pickedup.length).toBe(5);
    });
  });
});
