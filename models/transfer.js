const mongoose = require("mongoose");
const { Schema } = mongoose;

const transferSchema = new Schema({
  id: String,
  date: Date,
  time: String,
  price: Number,
  description: String,
  originAccountId: String,
  destinationAccountId: String,
  modified: Boolean,
});

const userTransferSchema = new Schema({
  dni: {
    type: String,
    unique: true,
  },
  transfers: [transferSchema],
});

module.exports = mongoose.model("Transfers", userTransferSchema);
