require("../../../init/mongodb");
require("dotenv").config();
const config = require("config");
const controller = require("../../../controller/reservations");
const bookController = require("../../../controller/books");
const offersController = require("../../../controller/offers");
const { MongoClient } = require("mongodb");
const bookHelper = require("../../../helpers/books");

const book = {
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
const offer = {
  provider: {
    sub: "auth0|idstring",
    nickname: "Mr. Test",
    picture: "picture-url",
  },
  book: null,
  zip: 10409,
  city: "Berlin",
};

describe("Reservations Controller", () => {
  let client;
  let db;
  let bookInDatabase;
  let offerInDatabase;
  let reservation;
  let validObjectId;

  beforeAll(async () => {
    client = await MongoClient.connect(config.database.host, {
      useNewUrlParser: true,
    });
    db = await client.db(config.database.name);
    reservationCollection = db.collection("reservations");

    // * Create a book and an offer in the database for valid ids
    bookInDatabase = await bookController.createBookInDatabase(book);
    offer.book = bookInDatabase._id.toString();
    offerInDatabase = await offersController.create(offer);
    validObjectId = offerInDatabase._id.toString();
  });

  afterAll(async () => {
    await db.collection("books").drop();
    await db.collection("offers").drop();
    await db.collection("reservations").drop();
    await client.close();
  });

  describe("Create reservation", () => {
    beforeEach(() => {
      const until = new Date(); // today
      until.setDate(until.getDate() + 3); // add 3 days

      reservation = {
        collector: {
          sub: "auth0|collector",
          nickname: "Mrs. Collector",
          picture: "colletor-picture-url",
        },
        until: until,
        offer: offerInDatabase._id.toString(),
      };
    });

    it("should throw an error if no reservation is given", async () => {
      await expect(controller.create()).rejects.toThrow();
    });

    it("should throw an error if the reservation is not an object", async () => {
      await expect(controller.create([])).rejects.toThrow();
      await expect(controller.create("offer")).rejects.toThrow();
      await expect(controller.create(123)).rejects.toThrow();
      await expect(controller.create(true)).rejects.toThrow();
    });

    it("should throw an error if the collector is mising in the given reservation", async () => {
      delete reservation.collector;
      await expect(controller.create(reservation)).rejects.toThrowError(
        /collector/
      );
    });

    it("should throw an error if the until date is mising in the given reservation", async () => {
      delete reservation.until;
      await expect(controller.create(reservation)).rejects.toThrowError(
        /until/
      );
    });

    it("should throw an error if the until date is mising in the given reservation", async () => {
      delete reservation.until;
      await expect(controller.create(reservation)).rejects.toThrowError(
        /until/
      );
    });

    describe("Collector check", () => {
      it("should throw an error if the sub of the given Collector is missing", async () => {
        delete reservation.collector.sub;
        await expect(controller.create(reservation)).rejects.toThrowError(
          /sub/
        );
      });

      it("should throw an error if the nickname of the given Collector is missing", async () => {
        delete reservation.collector.nickname;
        await expect(controller.create(reservation)).rejects.toThrowError(
          /nickname/
        );
      });
    });

    it("should return an created offer from the database if the given offer is valid", async () => {
      const createdOffer = await controller.create(reservation);

      expect(createdOffer).toBeTruthy();
      expect(createdOffer._id).toBeTruthy();
      expect(createdOffer.collector.sub).toBe(reservation.collector.sub);
      expect(createdOffer.collector.nickname).toBe(
        reservation.collector.nickname
      );
      expect(createdOffer.offer.toString()).toBe(reservation.offer);
    });
  });

  describe("Update reservation", () => {
    beforeEach(() => {
      const until = new Date(); // today
      until.setDate(until.getDate() + 3); // add 3 days

      reservation = {
        collector: {
          sub: "auth0|collector",
          nickname: "Mrs. Collector",
          picture: "colletor-picture-url",
        },
        until: until,
        offer: offerInDatabase._id.toString(),
      };
    });

    it("should throw an error if no id is given", async () => {
      await expect(controller.update()).rejects.toThrow(/invalid id/);
    });

    it("should throw an error the given id is not a string", async () => {
      await expect(controller.update([])).rejects.toThrow(/invalid id/);
      await expect(controller.update(123)).rejects.toThrow(/invalid id/);
      await expect(controller.update(true)).rejects.toThrow(/invalid id/);
      await expect(controller.update({})).rejects.toThrow(/invalid id/);
    });

    it("should throw an error if the given id is not a valid objectId", async () => {
      await expect(controller.update("123")).rejects.toThrow(/invalid id/);
    });

    it("should throw an error if the update is missing", async () => {
      await expect(controller.update(validObjectId)).rejects.toThrow(
        /invalid update/
      );
    });

    it("should throw an error if the update is not an object", async () => {
      await expect(controller.update(validObjectId, 123)).rejects.toThrow(
        /invalid update/
      );
      await expect(controller.update(validObjectId, [])).rejects.toThrow(
        /invalid update/
      );
      await expect(controller.update(validObjectId, true)).rejects.toThrow(
        /invalid update/
      );
      await expect(controller.update(validObjectId, "123")).rejects.toThrow(
        /invalid update/
      );
    });

    it("should throw an error if the given id is not found in datatbase", async () => {
      await expect(
        controller.update(validObjectId, { state: "deleted" })
      ).rejects.toThrow(/No reservation found/);
    });

    it("should throw an error if the given state update is not a string", async () => {
      const createdReservation = await controller.create(reservation);

      await expect(
        controller.update(createdReservation._id.toString(), { state: 123 })
      ).rejects.toThrow(/invalid state/);
      await expect(
        controller.update(createdReservation._id.toString(), { state: [] })
      ).rejects.toThrow(/invalid state/);
      await expect(
        controller.update(createdReservation._id.toString(), { state: true })
      ).rejects.toThrow(/invalid state/);
      await expect(
        controller.update(createdReservation._id.toString(), { state: {} })
      ).rejects.toThrow(/invalid state/);
    });

    it("should throw an error if the given state is not pending, delted or pickedup", async () => {
      const createdReservation = await controller.create(reservation);

      await expect(
        controller.update(createdReservation._id.toString(), { state: "state" })
      ).rejects.toThrow(/invalid state/);
    });

    it("should throw an error if the given until update is not a date", async () => {
      const createdReservation = await controller.create(reservation);

      await expect(
        controller.update(createdReservation._id.toString(), { until: 123 })
      ).rejects.toThrow(/invalid until/);
      await expect(
        controller.update(createdReservation._id.toString(), { until: [] })
      ).rejects.toThrow(/invalid until/);
      await expect(
        controller.update(createdReservation._id.toString(), { until: true })
      ).rejects.toThrow(/invalid until/);
      await expect(
        controller.update(createdReservation._id.toString(), { until: {} })
      ).rejects.toThrow(/invalid until/);
    });

    it("should return the updated reservation with a new until date", async () => {
      const until = new Date(); // today
      until.setDate(until.getDate() + 7); // add 7 days
      const update = { until: until };

      const createdReservation = await controller.create(reservation);

      const updatedReservation = await controller.update(
        createdReservation._id.toString(),
        update
      );
      expect(updatedReservation).toBeTruthy();
      expect(updatedReservation.until.toString()).toBe(until.toString());
    });

    it("should return the updated reservation with a new state date", async () => {
      const update = { state: "deleted" };

      const createdReservation = await controller.create(reservation);

      const updatedReservation = await controller.update(
        createdReservation._id.toString(),
        update
      );
      expect(updatedReservation).toBeTruthy();
      expect(updatedReservation.state).toBe(update.state);
    });

    it("should throw an error if the given update has no valid properties", async () => {
      const createdReservation = await controller.create(reservation);

      await expect(
        controller.update(createdReservation._id.toString(), {
          useless: "useless",
        })
      ).rejects.toThrow(/invalid reservation update/);
    });
  });

  describe("Get Reservations", () => {
    beforeAll(async () => {
      const until = new Date(); // today
      until.setDate(until.getDate() + 3); // add 3 days

      reservation = {
        collector: {
          sub: "auth0|collector",
          nickname: "Mrs. Collector",
          picture: "colletor-picture-url",
        },
        until: until,
        offer: offerInDatabase._id.toString(),
      };

      const createReservationPromises = [];

      for (let i = 0; i < 15; i++) {
        createReservationPromises.push(controller.create(reservation));
      }

      await Promise.all(createReservationPromises);
    });

    it("should return the latest ten reservations from the reservations collection if no filter was applied", async () => {
      const reservations = await controller.get();

      expect(reservations.length).toBe(10);
    });
  });

  describe("Filter & Pagination", () => {
    beforeAll(async () => {
      const until = new Date("2021-05-05T12:00:00");

      reservation = {
        collector: {
          sub: "auth0|collector",
          nickname: "Mrs. Collector",
          picture: "colletor-picture-url",
        },
        until: until,
        offer: offerInDatabase._id.toString(),
      };

      const createReservationPromises = [];

      for (let i = 0; i < 15; i++) {
        if (i >= 6) reservation.state = "pickedup";
        if (i >= 11) {
          reservation.collector.sub = "auth0|test";
        }
        if (i >= 9) {
          reservation.until = new Date("2021-05-10T12:00:00");
        }
        createReservationPromises.push(controller.create(reservation));
      }

      await Promise.all(createReservationPromises);
    });

    it("should return two pages if no filter is applied and the last id of page one is given to page two", async () => {
      const page1 = await controller.get();
      const page2 = await controller.get(false, page1[9]._id.toString());

      expect(page1.length).toBe(10);
      expect(page2.length).toBeTruthy();
    });

    it("should return two pages if  filter are applied and the last id of page one is given to page two", async () => {
      const filter = {
        collector: { sub: "auth0|collector" },
      };
      const page1 = await controller.get(filter);
      const page2 = await controller.get(filter, page1[9]._id.toString());

      expect(page1.length).toBe(10);
      expect(page2.length).toBeTruthy();
    });

    it("should return nine reservation with state pickedup", async () => {
      const state = "pickedup";
      const reservations = await controller.get({
        state: state,
      });

      expect(reservations.length).toBe(9);
      expect(reservations[0].state).toBe(state);
      expect(reservations[5].state).toBe(state);
      expect(reservations[8].state).toBe(state);
    });

    it("should return four reservation with collector.sub auth0|test", async () => {
      const sub = "auth0|test";
      const reservations = await controller.get({
        collector: { sub: sub },
      });

      expect(reservations.length).toBe(4);
      expect(reservations[0].collector.sub).toBe(sub);
      expect(reservations[3].collector.sub).toBe(sub);
    });

    it("should return nine reservation the until date 10.5.21", async () => {
      const until = new Date("2021-05-10T12:00:00");

      const reservations = await controller.get({
        until: until,
      });

      expect(reservations.length).toBe(9);
    });
  });

  describe("Get a reservation by id", () => {
    it("should throw an invalid reservation id error if the id is not given", async () => {
      await expect(controller.getById()).rejects.toThrow();
    });
    it("should throw an invalid reservation id error if given id is not a string or number", async () => {
      await expect(controller.getById([])).rejects.toThrow();
      await expect(controller.getById({})).rejects.toThrow();
      await expect(controller.getById(true)).rejects.toThrow();
    });
    it("should throw an invalid reservation id error if given id is not a valid object id", async () => {
      await expect(controller.getById("hello world")).rejects.toThrow();
      await expect(controller.getById("123")).rejects.toThrow();
    });

    it("should return a reservation from the database if the given id is valid", async () => {
      const reservations = await controller.get();

      const selectedReservationToCheck = reservations[0];

      const reservation = await controller.getById(
        selectedReservationToCheck._id.toString()
      );

      expect(selectedReservationToCheck._id).toEqual(reservation._id);
    });
  });

  describe("Get all user reservations", () => {
    let booksInDatabase;
    let offersInDatabase;
    const validUser = {
      sub: "auth0|user",
      nickname: "Collector",
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
        const offer = {
          provider: {
            sub: "auth0|provider",
            nickname: "Provider",
            picture: "picture-url",
          },
          book: book._id.toString(),
          zip: 10409,
          city: "Berlin",
        };

        return offersController.create(offer);
      });

      offersInDatabase = await Promise.all(createOffersPromises);

      let createReservationsPromises = offersInDatabase.map((offer, index) => {
        let state = "reserved";
        if (index >= 10 && index < 15) state = "pickedup";
        if (index >= 15 && index < 20) state = "expired";
        if (index >= 20) state = "deleted";

        const reservation = {
          collector: validUser,
          until: new Date("2030-01-01"),
          offer: offer._id.toString(),
          state: state,
        };

        return controller.create(reservation);
      });

      await Promise.all(createReservationsPromises);
    });

    it("should throw an invalid user if no user is given", async () => {
      await expect(controller.getByUser()).rejects.toThrow(/invalid user/);
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
      const userWithoutReservations = {
        sub: "auth0|noReservations",
        nickname: "no reservation",
        picture: "pic",
      };

      const reservation = await controller.getByUser(userWithoutReservations);

      expect(reservation).toBeTruthy();
      expect(reservation.length).toBe(0);
    });

    it("should return 20 reservations in total where 10 reservation are state reserved, 5 are  pickedup and 5 are expired for the validUser", async () => {
      const reservations = await controller.getByUser(validUser);

      const reserved = reservations.filter(
        (reservation) => reservation.state === "reserved"
      );
      const expired = reservations.filter(
        (reservation) => reservation.state === "expired"
      );
      const deleted = reservations.filter(
        (reservation) => reservation.state === "deleted"
      );
      const pickedup = reservations.filter(
        (reservation) => reservation.state === "pickedup"
      );

      expect(reservations).toBeTruthy();
      expect(reservations.length).toBe(20);

      expect(reserved.length).toBe(10);
      expect(pickedup.length).toBe(5);
      expect(expired.length).toBe(5);
      expect(deleted.length).toBe(0);
    });
  });
});
