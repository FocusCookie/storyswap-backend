require("dotenv").config();
const config = require("config");

const { MongoClient } = require("mongodb");

//TODO: ADD tests when developing the controller

describe("insert", () => {
  let client;
  let db;

  beforeAll(async () => {
    client = await MongoClient.connect(config.database.host, {
      useNewUrlParser: true,
    });
    db = await client.db(config.database.name);
  });

  afterAll(async () => {
    await client.close();
  });

  it("should insert a doc into collection", async () => {
    const test = db.collection("test");

    const mockUser = { _id: "test123", name: "Mr Test" };
    await test.insertOne(mockUser);

    const insertedUser = await test.findOne({ _id: "test123" });
    expect(insertedUser).toEqual(mockUser);
    await test.deleteOne({ _id: "test123" });
  });
});
