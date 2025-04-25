const mongoose = require("mongoose");

mongoose.connect("mongodb://0.0.0.0:27017/ottstream"); // db name ottstream

const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log(
    "MongoDB link established, roger that. \n \t \t \t \t  \t Mongoose ODM activated, copy that.\vHappy suffering, over and out."
  );
});

module.exports = db;
