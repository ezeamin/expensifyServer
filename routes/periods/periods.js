const express = require("express");
const router = express.Router();

const isAuthenticated = require("../../helpers/isAuthenticated");
//const addNewMonth = require("../../helpers/addNewMonth");

const DbPeriod = require("../../models/period");
const DbUsers = require("../../models/user");
const DbExpenses = require("../../models/expense");
const DbCategories = require("../../models/category");
const DbAccounts = require("../../models/account");
const DbIncomes = require("../../models/income");
const DbTransfers = require("../../models/transfer");

const daysInMonth = require("../../helpers/daysInMonth");
const resetSpent = require("../../helpers/db/resetSpent");
const resetTables = require("../../helpers/db/resetTables");
const resetPayments = require("../../helpers/db/resetPayments");

router.get("/api/isNewMonth", isAuthenticated, async (req, res) => {
  const dni = process.env.NODE_ENV === "test" ? "12345678" : req.user.dni;

  const date = new Date();
  DbUsers.findOne({ dni }, async (err, user) => {
    if (err) {
      console.log(err);
    } else {
      if (user.currentPeriod !== date.getMonth()) {
        user.currentPeriod++;

        if (user.currentPeriod === 12) {
          user.currentPeriod = 0;
        }

        await user.save();
        res.json({ isNewMonth: true });
      } else {
        res.json({ isNewMonth: false });
      }
    }
  });
});

router.get("/api/periods", isAuthenticated, async (req, res) => {
  const dni = process.env.NODE_ENV === "test" ? "12345678" : req.user.dni;

  const periodos = await DbPeriod.findOne({ dni });
  if (periodos.length === 0) {
    return res.sendStatus(404);
  }

  res.json(periodos);
});

router.put("/api/period", isAuthenticated, async (req, res) => {
  const dni = process.env.NODE_ENV === "test" ? "12345678" : req.user.dni;
  let month = new Date().getMonth() - 1;
  let year = new Date().getFullYear();

  const user = DbUsers.findOne({dni})
  const incorporationDate = new Date(user.incorporation);
  if(incorporationDate.getMonth() === (new Date()).getMonth()) return res.sendStatus(304);

  if (month === -1) {
    month = 11;
    year--;
  }

  const old = await DbPeriod.findOne({ dni });
  if (!old) {
    return res.status(404).json({
      message: "No existe el documento",
    });
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
    start: new Date(year, month, 1),
    end: new Date(year, month, daysInMonth(month, year)),
    days: daysInMonth(month, year),
    balance,
    spent: spent,
    income: incomesDoc.totalIncome,
    incomes: incomesDoc.incomes,
    expenses: expensesDoc.expenses,
    transfers: transfersDoc.transfers,
    accounts: accountsDoc.accounts,
    categories: categoriesDoc.categories,
  };

  old.periods.push(newPeriod);

  old.save((err) => {
    if (err) {
      return res.status(500).json({
        message: "Error al guardar",
        err,
      });
    }

    resetSpent("account", dni);
    resetSpent("category", dni);

    resetTables(dni);
    resetPayments(dni);

    return res.status(200).json(old);
  });
});

module.exports = router;
