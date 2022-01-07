const mongoose = require("mongoose");
require("dotenv").config();
const config = require("config");
const debug = require("debug")("INIT:MONGODB");

debug("DB NAME ", config.database.name);

const host =
  config.environment === "dev"
    ? "mongodb://localhost:27017"
    : config.database.host;

mongoose
  .connect(host, {
    dbName: config.database.name,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    debug("MongoDB is connected.");
  })
  .catch((err) => {
    debug("Something went wrong while connecting to MongoDB.");
    debug("%s", err);
  });

mongoose.connection.on("connected", () => {
  debug("Mongoose is connected to MongoDB.");
});

mongoose.connection.on("error", (err) => {
  debug("Something went wrong while connecting to Mongoose with MongoDB.");
  debug("%s", err);
});

mongoose.connection.on("disconnected", () => {
  debug("Mongoose is disconnected from MongoDB.");
});

// Close the mongoose connection befoe shutting down the application
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  debug("Terminated - Mongoose is deconnected from MongoDB.");
  process.exit(0);
});
