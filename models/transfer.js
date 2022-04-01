const mongoose = require("mongoose");
const { Schema } = mongoose;

const transferSchema = new Schema({
  id: {
    type: String,
    unique: true,
  },
  date: Date,
  time: String,
  price: Number,
  description: String,
  originAccount: String,
  originAccountColor: String,
  destinationAccount: String,
  destinationAccountColor: String,
});

const userTransferSchema = new Schema({
  dni: {
    type: String,
    unique: true,
  },
  transfers: [transferSchema],
});

module.exports = mongoose.model("Transfers", userTransferSchema);
