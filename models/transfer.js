const mongoose = require("mongoose");
const { transferSchema } = require("./schemas");
const { Schema } = mongoose;

const userTransferSchema = new Schema({
  dni: {
    type: String,
    unique: true,
  },
  transfers: [transferSchema],
});

module.exports = mongoose.model("Transfers", userTransferSchema);

