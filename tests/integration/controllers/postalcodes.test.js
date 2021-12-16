require("../../../init/mongodb");
require("dotenv").config();
const config = require("config");
const controller = require("../../../controller/postalcodes");
const { MongoClient, TopologyDescriptionChangedEvent } = require("mongodb");

const VALID_ZIP = 10409;
const VALID_CITY = "Berlin";
const VALID_COORDINATES = [13.436831, 52.547466];

describe("Postalcodes Controller", () => {
  let client;
  let db;
  let postalcodesCollection;

  beforeAll(async () => {
    client = await MongoClient.connect(config.database.host, {
      useNewUrlParser: true,
    });
    db = await client.db(config.database.name);
    postalcodesCollection = db.collection("postalcodes");
  });

  afterAll(async () => {
    await db.collection("postalcodes").drop();
    await client.close();
  });

  describe("createWithZipAndCity", () => {
    it("should return an invalid zip error if no zip is given", async () => {
      await expect(controller.createWithZipAndCity()).rejects.toThrow(
        /invalid zip/gi
      );
    });

    it("should throw an error with invalid zip if the given zip is not a number", async () => {
      await expect(controller.createWithZipAndCity("12345")).rejects.toThrow(
        /invalid zip/gi
      );
      await expect(controller.createWithZipAndCity(true)).rejects.toThrow(
        /invalid zip/gi
      );
      await expect(
        controller.createWithZipAndCity([1, 2, 3, 4, 5])
      ).rejects.toThrow(/invalid zip/gi);
      await expect(
        controller.createWithZipAndCity({ zip: 12345 })
      ).rejects.toThrow(/invalid zip/gi);
    });

    it("should throw an error if the given zip is under 10000", async () => {
      await expect(controller.createWithZipAndCity(9999)).rejects.toThrow(
        /5 digits/gi
      );
    });

    it("should throw an error if the given zip is over 99999", async () => {
      await expect(controller.createWithZipAndCity(9999)).rejects.toThrow(
        /5 digits/gi
      );
    });

    it("should throw an error with invalid city if no city is given", async () => {
      await expect(controller.createWithZipAndCity(VALID_ZIP)).rejects.toThrow(
        /invalid city/gi
      );
    });

    it("should throw an error with invalid city if the given city is not a string", async () => {
      await expect(
        controller.createWithZipAndCity(VALID_ZIP, 123)
      ).rejects.toThrow(/invalid city/gi);
      await expect(
        controller.createWithZipAndCity(VALID_ZIP, true)
      ).rejects.toThrow(/invalid city/gi);
      await expect(
        controller.createWithZipAndCity(VALID_ZIP, [1, 2, 3, 4, 5])
      ).rejects.toThrow(/invalid city/gi);
      await expect(
        controller.createWithZipAndCity(VALID_ZIP, { city: "12345" })
      ).rejects.toThrow(/invalid city/gi);
    });

    it("should throw an error with no coordinates exists if there is no postalcode for the given city and zip combination", async () => {
      await expect(
        controller.createWithZipAndCity(VALID_ZIP, "Hamburg")
      ).rejects.toThrow(/no coordinates/gi);
    });

    it("should return an postalcode for the given valid zip and city and have the correct coordinates in it", async () => {
      const postalcode = await controller.createWithZipAndCity(
        VALID_ZIP,
        VALID_CITY
      );

      expect(postalcode).toBeTruthy();
      expect(postalcode._id).toBeTruthy();
      expect(postalcode.city).toBe(VALID_CITY);
      expect(postalcode.zip).toBe(VALID_ZIP);
      expect(postalcode.coordinates).toStrictEqual(VALID_COORDINATES);
    });
  });
});
