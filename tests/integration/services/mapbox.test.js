const mapbox = require("../../../services/mapbox");

const DELAY = 1500;
const VALID_ZIP = 10409;
const VALID_CITY = "Berlin";
const VALID_COORDINATES = [13.436831, 52.547466];

const delayNextApiCall = () => {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      resolve(true);
    }, DELAY);
  });
};

describe("MAPBOX API", () => {
  describe("getZipCoordinates", () => {
    it("should throw an error with invalid zip if no zip is given", async () => {
      await expect(mapbox.getZipCoordinates()).rejects.toThrow(/invalid zip/gi);
    });

    it("should throw an error with invalid zip if the given zip is not a number", async () => {
      await expect(mapbox.getZipCoordinates("12345")).rejects.toThrow(
        /invalid zip/gi
      );
      await expect(mapbox.getZipCoordinates(true)).rejects.toThrow(
        /invalid zip/gi
      );
      await expect(mapbox.getZipCoordinates([1, 2, 3, 4, 5])).rejects.toThrow(
        /invalid zip/gi
      );
      await expect(mapbox.getZipCoordinates({ zip: 12345 })).rejects.toThrow(
        /invalid zip/gi
      );
    });

    it("should throw an error if the given zip is under 10000", async () => {
      await expect(mapbox.getZipCoordinates(9999)).rejects.toThrow(
        /5 digits/gi
      );
    });

    it("should throw an error if the given zip is over 99999", async () => {
      await expect(mapbox.getZipCoordinates(9999)).rejects.toThrow(
        /5 digits/gi
      );
    });

    it("should throw an error with invalid city if no city is given", async () => {
      await expect(mapbox.getZipCoordinates(VALID_ZIP)).rejects.toThrow(
        /invalid city/gi
      );
    });

    it("should throw an error with invalid city if the given city is not a string", async () => {
      await expect(mapbox.getZipCoordinates(VALID_ZIP, 123)).rejects.toThrow(
        /invalid city/gi
      );
      await expect(mapbox.getZipCoordinates(VALID_ZIP, true)).rejects.toThrow(
        /invalid city/gi
      );
      await expect(
        mapbox.getZipCoordinates(VALID_ZIP, [1, 2, 3, 4, 5])
      ).rejects.toThrow(/invalid city/gi);
      await expect(
        mapbox.getZipCoordinates(VALID_ZIP, { city: "12345" })
      ).rejects.toThrow(/invalid city/gi);
    });

    it("should return null if no coordinates is found for the zip city combination", async () => {
      const coordinates = await mapbox.getZipCoordinates(VALID_ZIP, "Hamburg");

      expect(coordinates).toBeFalsy();
    });

    it("should return the coordinates for the given zip and city", async () => {
      const coordinates = await mapbox.getZipCoordinates(VALID_ZIP, VALID_CITY);

      expect(coordinates).toBeTruthy();
      expect(coordinates[0]).toBeTruthy();
      expect(coordinates[1]).toBeTruthy();
      expect(coordinates).toStrictEqual(VALID_COORDINATES);
    });
  });
});
