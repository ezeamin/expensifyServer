const mongoose = require("mongoose");
const { periodSchema } = require("./schemas");
const { Schema } = mongoose;

const userOldSchema = new Schema({
  dni: {
    type: String,
    unique: true,
  },
  periods: [
    {
      year: Number,
      periods: [periodSchema],
    },
  ],
});

module.exports = mongoose.model("Old", userOldSchema);
