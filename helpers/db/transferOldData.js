const DbUsers = require("../../models/user");
const DbAccounts = require("../../models/account");
const DbExpenses = require("../../models/expense");
const DbIncomes = require("../../models/income");
const DbTransfers = require("../../models/transfer");
// const DbDebts = require("../../models/debt");
// const DbPayments = require("../../models/payment");
const DbPeriods = require("../../models/period");
const DbCategories = require("../../models/category");

const resetSpent = require("./resetSpent");
const resetTables = require("./resetTables");
const resetPayments = require("./resetPayments");
const daysInMonth = require("../daysInMonth");
const roundToTwo = require("../roundToTwo");
const generarCodigo = require("../generarCodigo");

const resetAndUpdate = async (user) => {
  const dni = user.dni;

  let month = new Date().getMonth() - 1; // from 0 to 11, -1 to get the previous month
  let year = new Date().getFullYear();

  if (month === -1) {
    month = 11;
    year -= 1;
  }

  const old = await DbPeriods.findOne({ dni });
  if (!old) {
    console.log("No hay periodos");
    return;
  }

  const expensesDoc = await DbExpenses.findOne({ dni });
  const incomesDoc = await DbIncomes.findOne({ dni });
  const transfersDoc = await DbTransfers.findOne({ dni });
  const categoriesDoc = await DbCategories.findOne({ dni });
  const accountsDoc = await DbAccounts.findOne({ dni });

  const spent = accountsDoc.accounts.reduce(
    (acc, account) => acc + account.spent,
    0
  );
  const balance = accountsDoc.accounts.reduce(
    (acc, account) => acc + account.balance,
    0
  );

  let startDate = new Date(year, month, 1);
  let endDate = new Date(year, month + 1, 0);

  const tzOffset = startDate.getTimezoneOffset();
  if (tzOffset !== 180) {
    startDate.setMinutes(startDate.getMinutes() + tzOffset * -1);
    endDate.setMinutes(endDate.getMinutes() + tzOffset * -1);
  }

  const newPeriod = {
    id: generarCodigo(8),
    start: startDate,
    end: endDate,
    days: daysInMonth(month, year),
    balance: roundToTwo(balance),
    spent: roundToTwo(spent),
    income: roundToTwo(incomesDoc.totalIncome),
    limit: accountsDoc.generalLimit,
    incomes: incomesDoc.incomes,
    expenses: expensesDoc.expenses,
    transfers: transfersDoc.transfers,
    accounts: accountsDoc.accounts,
    categories: categoriesDoc.categories,
  };

  const yearDocIndex = old.periods.findIndex((period) => {
    return period.year === year;
  });

  if (yearDocIndex !== -1) {
    old.periods[yearDocIndex].periods.push(newPeriod);
  } else {
    old.periods.push({ year, periods: [newPeriod] });
  }

  old.save((err) => {
    if (err) {
      // error
      console.log(err);
    }

    resetSpent("account", dni);
    resetSpent("category", dni);

    resetTables(dni, expensesDoc, incomesDoc, transfersDoc);
    resetPayments(dni);
    console.log("Periodo actualizado");
  });
};

const transferOldData = async () => {
  const dt = new Date();
  const month = dt.getMonth();

  const user = await DbUsers.findOne({ dni: "43706393" });

  //currentPeriod: 6 - month: 7 (starts at 0)
  if (user.currentPeriod !== month) {
    // make all changes
    const users = await DbUsers.find();
    const dnis = users.map((user) => user.dni);

    dnis.forEach(async (dni) => {
      const user = await DbUsers.findOne({ dni });
      user.currentPeriod++;

      if (user.currentPeriod === 12) {
        user.currentPeriod = 0;
      }

      await user.save();

      resetAndUpdate(user);
    });
  }
};

module.exports = transferOldData;
