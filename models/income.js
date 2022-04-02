const mongoose = require("mongoose");
const { Schema } = mongoose;

const incomeSchema = new Schema({
  id: String,
  title: String,
  date: Date,
  price: Number,
  description: String,
  accountId: String,
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
