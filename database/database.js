const { mongodb } = require("./keys");
const mongoose = require("mongoose");

mongoose
  .connect(mongodb.URI, { useNewUrlParser: true })
  .then(() => process.env.NODE_ENV !== "test" ? console.log("DB is connected") : null)
  .catch((err) => console.log(err));
