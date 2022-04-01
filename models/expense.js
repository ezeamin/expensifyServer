const mongoose = require("mongoose");
const { Schema } = mongoose;

const expenseSchema = new Schema({
  id: {
    type: String,
    unique: true,
  },
  title: String,
  icon: String,
  category: String,
  date: Date,
  time: String,
  price: Number,
  description: String,
  account: String,
  accountColor: String,
});

const userExpenseSchema = new Schema({
  dni: {
    type: String,
    unique: true,
  },
  expenses: [expenseSchema],
});

module.exports = mongoose.model("Expenses", userExpenseSchema);
