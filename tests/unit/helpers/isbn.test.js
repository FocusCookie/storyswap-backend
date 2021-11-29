const isbn = require("../../../helpers/isbn");

describe("Helper valid isbn or isbn13", () => {
  it("should return false if no isbn is given", () => {
    expect(isbn.isValideIsbnOrIsbn13()).toBe(false);
  });

  it("it should return false if the given isbn is under 9 or above 13 cahrs", () => {
    expect(isbn.isValideIsbnOrIsbn13("1")).toBe(false);
    expect(isbn.isValideIsbnOrIsbn13("12")).toBe(false);
    expect(isbn.isValideIsbnOrIsbn13("123")).toBe(false);
    expect(isbn.isValideIsbnOrIsbn13("1234")).toBe(false);
    expect(isbn.isValideIsbnOrIsbn13("12345")).toBe(false);
    expect(isbn.isValideIsbnOrIsbn13("123456")).toBe(false);
    expect(isbn.isValideIsbnOrIsbn13("123457")).toBe(false);
    expect(isbn.isValideIsbnOrIsbn13("123458")).toBe(false);
    expect(isbn.isValideIsbnOrIsbn13("12345678901234")).toBe(false);
  });

  it("it should return false if the given isbn has other chars than numbers and dashes", () => {
    expect(isbn.isValideIsbnOrIsbn13("123#14#14")).toBe(false);
    expect(isbn.isValideIsbnOrIsbn13("WWW42-240")).toBe(false);
  });

  it("it should return true if the given isbn is valid", () => {
    expect(isbn.isValideIsbnOrIsbn13("123456789")).toBe(true);
    expect(isbn.isValideIsbnOrIsbn13("1234567890123")).toBe(true);
  });
});
