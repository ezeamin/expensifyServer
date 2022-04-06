const DbAccounts = require("../../models/account");
const DbCategories = require("../../models/category");
const DbTransfers = require("../../models/transfer");
const DbExpenses = require("../../models/expense");
const DbIncomes = require("../../models/income");
const DbDebt = require("../../models/debt");
const DbPayment = require("../../models/payment");
const DbOld = require("../../models/period");

//debts,payments

const initiateUser = async (dni) => {
  const account = new DbAccounts({
    dni,
    spent: 0,
    accounts: [],
  });

  const category = new DbCategories({
    dni,
    categories: [],
  });

  const transfer = new DbTransfers({
    dni,
    transfers: [],
  });

  const expense = new DbExpenses({
    dni,
    expenses: [],
  });

  const income = new DbIncomes({
    dni,
    totalIncome: 0,
    incomes: [],
  });

  const debt = new DbDebt({
    dni,
    totalUserDebt: 0,
    totalOtherDebt: 0,
    userDebts: [],
    otherDebts: [],
  });

  const payment = new DbPayment({
    dni,
    payments: [],
  });

  const old = new DbOld({
    dni,
    periods: [],
  });

  await account.save();
  await category.save();
  await transfer.save();
  await expense.save();
  await income.save();
  await debt.save();
  await payment.save();
  await old.save();
};

module.exports = initiateUser;
