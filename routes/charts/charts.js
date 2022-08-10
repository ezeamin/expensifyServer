const express = require("express");
const router = express.Router();

const isAuthenticated = require("../../helpers/isAuthenticated");

const DbExpenses = require("../../models/expense");
const DbIncomes = require("../../models/income");
const DbCategories = require("../../models/category");
const DbAccounts = require("../../models/account");

router.get("/api/charts/chartData", isAuthenticated, async (req, res) => {
  const dni = process.env.NODE_ENV === "test" ? "12345678" : req.user.dni;

  const categoriesDoc = await DbCategories.findOne({ dni });
  const categoriesList = categoriesDoc.categories.map((category) => ({
    category: category.title,
    value: category.spent,
  }));

  console.log(categoriesList);
  res.status(200).json(categoriesList);
});

router.get("/api/charts/dayChart", isAuthenticated, async (req, res) => {
  const dni = process.env.NODE_ENV === "test" ? "12345678" : req.user.dni;

  const expDocument = await DbExpenses.findOne({ dni });
  const incDocument = await DbIncomes.findOne({ dni });

  const dt = new Date();
  const currentDay = dt.getDate();

  // the array will contain as many spaces as days had passed
  const list = new Array(currentDay).fill(undefined).map((_item, index) => ({
    day: index + 1,
    expenses: 0,
    incomes: 0,
  }));

  expDocument.expenses.map((exp) => {
    const date = new Date(exp.date);
    const day = Number.parseInt(date.toLocaleDateString().split("/")[0]);
    const value = list[day - 1].expenses;

    const total = value + exp.price;
    list[day - 1].expenses = total;
  });

  incDocument.incomes.map((inc) => {
    const date = new Date(inc.date);
    const day = Number.parseInt(date.toLocaleDateString().split("/")[0]);
    const value = list[day - 1].incomes;

    const total = value + inc.price;
    list[day - 1].incomes = total;
  });

  list.reverse();
  res.json(list);
});

module.exports = router;
