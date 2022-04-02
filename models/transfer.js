const mongoose = require("mongoose");
const { Schema } = mongoose;

const transferSchema = new Schema({
  id: {
    type: String,
  },
  date: Date,
  time: String,
  price: Number,
  description: String,
  originAccountId: String,
  destinationAccountId: String,
});

const userTransferSchema = new Schema({
  dni: {
    type: String,
    unique: true,
  },
  transfers: [transferSchema],
});

module.exports = mongoose.model("Transfers", userTransferSchema);
