const mongoose = require("mongoose");
const { accountSchema } = require("./schemas");
const { Schema } = mongoose;

const userAccountSchema = new Schema({
  dni: {
    type: String,
    unique: true,
  },
  generalLimit: Number,
  accounts: [accountSchema],
});

module.exports = mongoose.model("Accounts", userAccountSchema);
