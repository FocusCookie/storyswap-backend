const isbndb = require("../../../services/isbndb");

const delayNextApiCall = () => {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      resolve(true);
    }, 1500);
  });
};

describe("ISBN DB API", () => {
  describe("getBookByIsbnOrIsbn13", () => {
    it("should throw an error with invalid isbn if no isbn is given", async () => {
      await expect(isbndb.getBookByIsbnOrIsbn13()).rejects.toThrow();
    });

    it("should throw an error with invalid isbn if the given isbn is not 9-13 chars long", async () => {
      await expect(isbndb.getBookByIsbnOrIsbn13("1")).rejects.toThrow();
      await expect(isbndb.getBookByIsbnOrIsbn13("12")).rejects.toThrow();
      await expect(isbndb.getBookByIsbnOrIsbn13("123")).rejects.toThrow();
      await expect(isbndb.getBookByIsbnOrIsbn13("1234")).rejects.toThrow();
      await expect(isbndb.getBookByIsbnOrIsbn13("12345")).rejects.toThrow();
      await expect(isbndb.getBookByIsbnOrIsbn13("123456")).rejects.toThrow();
      await expect(isbndb.getBookByIsbnOrIsbn13("123457")).rejects.toThrow();
      await expect(isbndb.getBookByIsbnOrIsbn13("123458")).rejects.toThrow();
      await expect(
        isbndb.getBookByIsbnOrIsbn13("12345678901234")
      ).rejects.toThrow();
    });

    it("should throw an error with invalid isbn the given isbn includes other chars than numbers and dashes", async () => {
      await expect(
        isbndb.getBookByIsbnOrIsbn13("978#3-16-148410-0")
      ).rejects.toThrow();
      await expect(
        isbndb.getBookByIsbnOrIsbn13("WWW#3-16-148410-0")
      ).rejects.toThrow();
    });

    it("should return Harry Potter und der Stein der Weisen with the given isbn 9783551551672", async () => {
      const book = await isbndb.getBookByIsbnOrIsbn13("9783551551672");

      expect(book.title).toBe("Harry Potter und der Stein der Weisen");
      await delayNextApiCall();
    });
  });
});
