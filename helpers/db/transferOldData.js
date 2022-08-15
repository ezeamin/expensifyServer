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
  let month = new Date().getMonth(); // from 0 to 11
  let year = new Date().getFullYear();

  //   const incorporationDate = new Date(user.incorporation);
  //   if (incorporationDate.getMonth() === new Date().getMonth()) return;

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

  const newPeriod = {
    id: generarCodigo(8),
    start: new Date(year, month, 1),
    end: new Date(year, month, daysInMonth(month, year)),
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

  old.periods.push(newPeriod);

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
