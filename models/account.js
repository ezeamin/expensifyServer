const mongoose = require("mongoose");
const { Schema } = mongoose;

const accountSchema = new Schema({
    id: String,
    title: String,
    icon: String,
    color: String,
    accountType: String,
    balance: Number, 
    spent: Number,
    description: String,
    noBalance: Boolean,
});

const userAccountSchema = new Schema({
  dni: {
    type: String,
    unique: true,
  },
  spent: Number,
  generalBalance: Number,
  generalLimit: Number,
  accounts: [accountSchema],
});

module.exports = mongoose.model("Accounts", userAccountSchema);
