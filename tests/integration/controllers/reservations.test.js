require("../../../init/mongodb");
require("dotenv").config();
const config = require("config");
const controller = require("../../../controller/reservations");
const bookController = require("../../../controller/books");
const offersController = require("../../../controller/offers");
const { MongoClient } = require("mongodb");

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
});
