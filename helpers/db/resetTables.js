const resetTables = async (dni) => {
  const DbExpenses = require("../../models/expense");
  const DbIncomes = require("../../models/income");
  const DbTransfers = require("../../models/transfer");

  const expenses = await DbExpenses.findOne({ dni });
  const incomes = await DbIncomes.findOne({ dni });
  const transfers = await DbTransfers.findOne({ dni });

  expenses.expenses = [];
  incomes.incomes = [];
  transfers.transfers = [];

  incomes.totalIncome = 0;

  await expenses.save();
  await incomes.save();
  await transfers.save();
};

module.exports = resetTables;
