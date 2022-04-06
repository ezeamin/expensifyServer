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

const expenseSchema = new Schema({
  id: String,
  title: String,
  categoryId: String,
  accountId: String,
  date: Date,
  price: Number,
  description: String,
});

const transferSchema = new Schema({
  id: String,
  date: Date,
  title: String,
  price: Number,
  description: String,
  originAccountId: String,
  destinationAccountId: String,
});

const periodSchema = new Schema({
  start: Date,
  end: Date,
  days: Number,
  spent: Number,
  income: Number,
  incomes: [incomeSchema],
  expenses: [expenseSchema],
  transfers: [transferSchema],
});

const userOldSchema = new Schema({
  dni: {
    type: String,
    unique: true,
  },
  periods: [periodSchema],
});

module.exports = mongoose.model("Old", userOldSchema);
