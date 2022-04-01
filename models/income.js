const mongoose = require("mongoose");
const { Schema } = mongoose;

const incomeSchema = new Schema({
  id: {
    type: String,
    unique: true,
  },
  title: String,
  date: Date,
  time: String,
  price: Number,
  description: String,
  account: String,
  accountColor: String,
});

const userIncomeSchema = new Schema({
  dni: {
    type: String,
    unique: true,
  },
  totalIncome: Number,
  incomes: [incomeSchema],
});

module.exports = mongoose.model("Incomes", userIncomeSchema);
