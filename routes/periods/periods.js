const express = require("express");
const router = express.Router();

const isAuthenticated = require("../../helpers/isAuthenticated");
//const addNewMonth = require("../../helpers/addNewMonth");

const DbPeriod = require("../../models/period");
const DbUsers = require("../../models/user");
const transferOldData = require("../../helpers/db/transferOldData");

router.get("/api/isNewMonth", isAuthenticated, (req, res) => {
  const dni = process.env.NODE_ENV === "test" ? "12345678" : req.user.dni;

  const date = new Date();
  DbUsers.findOne({ dni }, (err, user) => {
    if (err) {
      console.log(err);
    } else {
      if (user.currentPeriod !== date.getMonth()) {
        res.json({ isNewMonth: true });
        transferOldData();
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

// router.put("/api/period", isAuthenticated, async (req, res) => {
//   return res.sendStatus(200);
//   const dni = process.env.NODE_ENV === "test" ? "12345678" : req.user.dni;
//   let month = new Date().getMonth(); // from 0 to 11
//   let year = new Date().getFullYear();

//   const user = await DbUsers.findOne({ dni });
//   const incorporationDate = new Date(user.incorporation);
//   if (incorporationDate.getMonth() !== new Date().getMonth())
//     return res.sendStatus(304);

//   const old = await DbPeriod.findOne({ dni });
//   if (!old) {
//     return res.status(404).json({
//       message: "No existe el documento",
//     });
//   }

//   const expensesDoc = await DbExpenses.findOne({ dni });
//   const incomesDoc = await DbIncomes.findOne({ dni });
//   const transfersDoc = await DbTransfers.findOne({ dni });
//   const categoriesDoc = await DbCategories.findOne({ dni });
//   const accountsDoc = await DbAccounts.findOne({ dni });

//   const spent = accountsDoc.accounts.reduce(
//     (acc, account) => acc + account.spent,
//     0
//   );
//   const balance = accountsDoc.accounts.reduce(
//     (acc, account) => acc + account.balance,
//     0
//   );

//   const newPeriod = {
//     start: new Date(year, month, 1),
//     end: new Date(year, month, daysInMonth(month, year)),
//     days: daysInMonth(month, year),
//     balance: roundToTwo(balance),
//     spent: roundToTwo(spent),
//     income: roundToTwo(incomesDoc.totalIncome),
//     limit: accountsDoc.generalLimit,
//     incomes: incomesDoc.incomes,
//     expenses: expensesDoc.expenses,
//     transfers: transfersDoc.transfers,
//     accounts: accountsDoc.accounts,
//     categories: categoriesDoc.categories,
//   };

//   old.periods.push(newPeriod);

//   old.save((err) => {
//     if (err) {
//       return res.status(500).json({
//         message: "Error al guardar",
//         err,
//       });
//     }

//     resetSpent("account", dni);
//     resetSpent("category", dni);

//     resetTables(dni);
//     resetPayments(dni);

//     return res.status(200).json(old);
//   });
// });

module.exports = router;
