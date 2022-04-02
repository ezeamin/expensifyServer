const mongoose = require("mongoose");
const { Schema } = mongoose;

const expenseSchema = new Schema({
  id: String,
  title: String,
  categoryId: String,
  accountId: String,
  date: Date,
  price: Number,
  description: String,
});

const userExpenseSchema = new Schema({
  dni: {
    type: String,
    unique: true,
  },
  expenses: [expenseSchema],
});

module.exports = mongoose.model("Expenses", userExpenseSchema);
