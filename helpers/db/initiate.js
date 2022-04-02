const DbAccounts = require("../../models/account");
const DbCategories = require("../../models/category");
const DbTransfers = require("../../models/transfer");
const DbExpenses = require("../../models/expense");
const DbIncomes = require("../../models/income");

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

  await account.save();
  await category.save();
  await transfer.save();
  await expense.save();
  await income.save();
};

module.exports = initiateUser;
