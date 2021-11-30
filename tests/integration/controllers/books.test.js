require("../../../init/mongodb");
require("dotenv").config();
const config = require("config");
const controller = require("../../../controller/books");
const Book = require("../../../models/book");
const bookHelper = require("../../../helpers/books");

const { MongoClient } = require("mongodb");

describe("Book Controller", () => {
  let client;
  let db;
  let testBook;

  beforeAll(async () => {
    client = await MongoClient.connect(config.database.host, {
      useNewUrlParser: true,
    });
    db = await client.db(config.database.name);
    booksCollection = db.collection("books");
  });

  afterAll(async () => {
    await db.collection("books").drop();
    await client.close();
  });

  describe("Create Book in Database with an book object", () => {
    beforeEach(() => {
      testBook = {
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
    });

    it("should throw an error if no book is given", async () => {
      await expect(controller.createBookInDatabase()).rejects.toThrow();
    });

    it("should return an invalid book error if the book is not an object", async () => {
      await expect(controller.createBookInDatabase(["book"])).rejects.toThrow();
      await expect(controller.createBookInDatabase(123)).rejects.toThrow();
      await expect(controller.createBookInDatabase(true)).rejects.toThrow();
      await expect(controller.createBookInDatabase("book")).rejects.toThrow();
    });

    it("should return an invalid book if no ISBN is given", async () => {
      delete testBook.isbn;
      await expect(controller.createBookInDatabase(testBook)).rejects.toThrow();
    });

    it("should return an invalid book if no ISBN13 is given", async () => {
      delete testBook.isbn13;
      await expect(controller.createBookInDatabase(testBook)).rejects.toThrow();
    });

    it("should return an invalid book if no title is given", async () => {
      delete testBook.title;
      await expect(controller.createBookInDatabase(testBook)).rejects.toThrow();
    });

    it("should return an object which has the same properties as the input book and the additional _id property form the DB", async () => {
      const bookInDatabase = await controller.createBookInDatabase(testBook);
      expect(bookInDatabase).toBeTruthy();
      expect(bookInDatabase.title).toBeTruthy();
      expect(bookInDatabase.isbn).toBeTruthy();
      expect(bookInDatabase.authors).toBeTruthy();
      expect(bookInDatabase._id).toBeTruthy();
    });
  });

  describe("Create Book with ISBN or ISBN13 in Database", () => {
    beforeEach(() => {
      testBook = {
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
    });

    it("should throw an error if no isbn is given", async () => {
      await expect(controller.createBookWithIsbnOrIsbn13()).rejects.toThrow();
    });

    it("should throw an error if the given isbn is not a string", async () => {
      await expect(controller.createBookWithIsbnOrIsbn13([])).rejects.toThrow();
      await expect(
        controller.createBookWithIsbnOrIsbn13(true)
      ).rejects.toThrow();
      await expect(controller.createBookWithIsbnOrIsbn13({})).rejects.toThrow();
    });

    it("should throw an error if the given isbn is under 9 and above 13 chars", async () => {
      await expect(
        controller.createBookWithIsbnOrIsbn13("12345678")
      ).rejects.toThrow();
      await expect(
        controller.createBookWithIsbnOrIsbn13("12345678901234")
      ).rejects.toThrow();
    });

    it("should throw an error if the given isbn has other chars than numbers and dashes", async () => {
      await expect(
        controller.createBookWithIsbnOrIsbn13("1*23*678")
      ).rejects.toThrow();
      await expect(
        controller.createBookWithIsbnOrIsbn13("12#14#")
      ).rejects.toThrow();
      await expect(
        controller.createBookWithIsbnOrIsbn13("12w14a")
      ).rejects.toThrow();
    });

    it("should  return the book from the database if the book is already in the database", async () => {
      const bookInDatabase = await Book.findOne({ isbn: testBook.isbn });
      expect(bookInDatabase).toBeTruthy();

      const bookFromController = await controller.createBookWithIsbnOrIsbn13(
        testBook.isbn
      );

      expect(bookInDatabase._id.toString()).toBe(
        bookFromController._id.toString()
      );
    });

    it("should call the ISBNDB api and store the book in the database and return the book if the book is not already in the database", async () => {
      const bookIsInDatabase = await Book.findOne({ isbn: testBook.isbn });
      if (bookIsInDatabase) {
        await Book.deleteOne({ _id: bookIsInDatabase._id });
      }

      const bookFromController = await controller.createBookWithIsbnOrIsbn13(
        testBook.isbn
      );

      expect(bookFromController).toBeTruthy();
      expect(bookFromController._id).toBeTruthy();
      expect(bookFromController.isbn).toBe(testBook.isbn);
      expect(bookFromController.isbn13).toBe(testBook.isbn13);
      expect(bookFromController.title).toBe(testBook.title);
    });
  });

  describe("Get books", () => {
    beforeEach(async () => {
      // create all books from the book helper in the database
      const createBooksPromises = [];
      bookHelper.books.forEach((book) => {
        createBooksPromises.push(controller.createBookInDatabase(book));
      });

      await Promise.all(createBooksPromises);
    });

    it("should return the latest ten books from the books collection if no filter was applied", async () => {
      const books = await controller.getBooks();

      expect(books.length).toBe(10);
    });

    describe("Filter", () => {
      it("should return seven harry potter books if the filter is set to title:'harry potter'", async () => {
        // * Be ware that the first harry potter book is added via a test before!

        const books = await controller.getBooks({
          title: "harry potter",
        });

        expect(books.length).toBe(7);
      });

      it("should return clean agile if the filter is authors: ['Robert C. Martin']", async () => {
        const books = await controller.getBooks({
          authors: ["Robert C. Martin"],
        });

        expect(books.length).toBe(1);
        expect(books[0].title).toMatch("Clean Agile: Back to Basics");
      });

      it("should return make time if the filter is set to isbn:'0593079582'", async () => {
        const books = await controller.getBooks({
          isbn: "0593079582",
        });

        expect(books.length).toBe(1);
        expect(books[0].title).toMatch("Make Time");
      });

      it("should return make time if the filter is set to title:'make time'", async () => {
        const books = await controller.getBooks({
          title: "make time",
        });

        expect(books.length).toBe(1);
        expect(books[0].title).toMatch("Make Time");
      });
    });

    describe("Pagination", () => {
      it("should return first 10 books and than 1 books if the lastFetchedBook is the 10th book from the first call - no filter applied", async () => {
        const firstPage = await controller.getBooks();
        const secondPage = await controller.getBooks(null, firstPage[9]._id);
        const thirdPage = await controller.getBooks(null, secondPage[9]._id);

        expect(firstPage.length).toBe(10);
        expect(secondPage.length).toBe(10);
        expect(thirdPage).toBeTruthy();
      });
    });

    describe("Pagination and Filter", () => {
      //TODO: Very strange behavior, sometimes the second page length is not always the same!
      it("should return first 10 books and than 1 books if the lastFetchedBook is the 10th book from the first call - no filter applied", async () => {
        const filter = { title: "sherlock" };
        const firstPage = await controller.getBooks(filter);
        const secondPage = await controller.getBooks(filter, firstPage[9]._id);

        expect(firstPage.length).toBe(10);
        expect(secondPage).toBeTruthy();
      });
    });
  });

  describe("Get a book by id", () => {
    it("should throw an invalid book id error if the id is not given", async () => {
      await expect(controller.getBookById()).rejects.toThrow();
    });
    it("should throw an invalid book id error if given id is not a string or number", async () => {
      await expect(controller.getBookById([])).rejects.toThrow();
      await expect(controller.getBookById({})).rejects.toThrow();
      await expect(controller.getBookById(true)).rejects.toThrow();
    });
    it("should throw an invalid book id error if given id is not a valid object id", async () => {
      await expect(controller.getBookById("hello world")).rejects.toThrow();
      await expect(controller.getBookById("123")).rejects.toThrow();
    });

    it("should return a book from the database if the given id is valid", async () => {
      const books = await controller.getBooks();

      const selectedBookToCheck = books[0];

      const book = await controller.getBookById(
        selectedBookToCheck._id.toString()
      );

      expect(selectedBookToCheck._id).toEqual(book._id);
      expect(selectedBookToCheck.title).toBe(book.title);
    });
  });
});
