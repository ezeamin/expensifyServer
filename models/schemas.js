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

const categorySchema = new Schema({
  id: String,
  title: String,
  icon: String,
  limit: Number,
  spent: Number,
  color: String,
  description: String,
});

const userDebtSchema = new Schema({
  id: String,
  lenderName: String,
  debts: [
    {
      id: String,
      destinationAccountId: String, // not mandatory
      date: Date,
      price: Number,
      description: String,
      modified: Boolean,
    },
  ],
});

const otherDebtSchema = new Schema({
  id: String,
  debtorName: String,
  debts: [
    {
      id: String,
      originAccountId: String, // not mandatory
      date: Date,
      price: Number,
      description: String,
    },
  ],
});

const expenseSchema = new Schema({
  id: String,
  title: String,
  categoryId: String,
  accountId: String,
  date: Date,
  price: Number,
  description: String,
  modified: Boolean,
});

const incomeSchema = new Schema({
  id: String,
  title: String,
  date: Date,
  price: Number,
  description: String,
  accountId: String,
  modified: Boolean,
});

const paymentSchema = new Schema({
  id: String,
  title: String,
  categoryId: String,
  accountId: String,
  date: Date,
  paymentDate: Date,
  price: Number,
  description: String,
  modified: Boolean,
});

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

const periodSchema = new Schema({
  start: Date,
  end: Date,
  days: Number,
  spent: Number,
  income: Number,
  incomes: [incomeSchema],
  expenses: [expenseSchema],
  transfers: [transferSchema],
  accounts: [accountSchema],
  categories: [categorySchema],
  payments: [paymentSchema],
  userDebts: [userDebtSchema],
  otherDebts: [otherDebtSchema],
});

module.exports = {
  accountSchema,
  categorySchema,
  userDebtSchema,
  otherDebtSchema,
  expenseSchema,
  incomeSchema,
  paymentSchema,
  transferSchema,
  periodSchema,
};
