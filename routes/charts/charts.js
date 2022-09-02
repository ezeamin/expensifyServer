const express = require("express");
const router = express.Router();

const isAuthenticated = require("../../helpers/isAuthenticated");

const DbExpenses = require("../../models/expense");
const DbIncomes = require("../../models/income");
const DbCategories = require("../../models/category");
const DbAccounts = require("../../models/account");
const DbOlds = require("../../models/period");
const roundToNearestHour = require("../../helpers/roundToNearestHour");
const getWeekDay = require("../../helpers/getWeekDay");
const differenceInWeeks = require("../../helpers/differenceInWeeks");

router.get("/api/charts/chartData", isAuthenticated, async (req, res) => {
  const dni = process.env.NODE_ENV === "test" ? "12345678" : req.user.dni;

  const categoriesDoc = await DbCategories.findOne({ dni });
  const categoriesList = categoriesDoc.categories.map((category) => ({
    category: category.title,
    value: category.spent,
  }));

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

    if (!exp.tzOffset) exp.tzOffset = 180; // default ARG value
    //set to local tz
    date.setMinutes(date.getMinutes() - exp.tzOffset);

    const day = date.getDate();
    const value = list[day - 1].expenses;

    const total = value + exp.price;
    list[day - 1].expenses = total;
  });

  incDocument.incomes.map((inc) => {
    const date = new Date(inc.date);

    if (!inc.tzOffset) inc.tzOffset = 180; // default ARG value
    //set to local tz
    date.setMinutes(date.getMinutes() - inc.tzOffset);

    const day = date.getDate();
    const value = list[day - 1].incomes;

    const total = value + inc.price;
    list[day - 1].incomes = total;
  });

  list.reverse();
  res.json(list);
});

router.get("/api/charts/weekChart", isAuthenticated, async (req, res) => {
  const dni = process.env.NODE_ENV === "test" ? "12345678" : req.user.dni;

  const expDocument = await DbExpenses.findOne({ dni });
  let days = new Array(7).fill(undefined).map((el, day) => {
    let array = [];
    for (let i = 0; i < 12; i++) {
      // arithmetic progression that starts in 7
      let hour = 7 + 2 * i;
      if (hour > 23) hour = hour % 24;
      hour = hour + "hs";

      const weekday = getWeekDay(day);

      array.push({
        hour,
        weekday,
        value: 0,
      });
    }
    return array;
  });

  expDocument.expenses.map((exp) => {
    const date = new Date(exp.date);

    if (!exp.tzOffset) exp.tzOffset = 180; // default ARG value
    //set to local tz
    date.setMinutes(date.getMinutes() - exp.tzOffset);

    const day = date.getDay(); //0 - sunday
    let hour = roundToNearestHour(date).getHours();

    if (hour < 7) hour = 24 + hour;

    if (hour % 2 === 0) hour--;

    const hourIndex = (hour - 7) / 2;
    days[day][hourIndex].value += exp.price;
  });

  const dtCurrent = new Date();
  const year = dtCurrent.getFullYear();
  const month = dtCurrent.getMonth();
  const dtStart = new Date(year, month, 1);

  const weeksPassedInMonths = differenceInWeeks(dtCurrent, dtStart) + 1;

  if (weeksPassedInMonths > 1) {
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 12; j++) {
        days[i][j].value = Math.round(days[i][j].value / weeksPassedInMonths);
      }
    }
  }

  let list = [];
  for (let i = 0; i < 7; i++) {
    list = list.concat(days[i]);
  }

  res.json(list);
});

router.get(
  "/api/charts/spentAndIncomeOldChart/:year",
  isAuthenticated,
  async (req, res) => {
    const dni = process.env.NODE_ENV === "test" ? "12345678" : req.user.dni;
    const year = req.params.year;

    const periodDocument = await DbOlds.findOne({ dni });

    const yearDoc = periodDocument.periods.find(
      (period) => period.year === Number(year)
    );

    const currentMonth = new Date().getMonth();
    //create array with n elements, where n is the number of months
    const list = new Array(currentMonth + 1)
      .fill(undefined)
      .map((_el, index) => ({
        month: index,
        spent: 0,
        income: 0,
      }));

    yearDoc.periods.forEach((period) => {
      const month = Number(period.start.toISOString().split("-")[1]) - 1;

      list.forEach((el) => {
        if (el.month === month) {
          el.spent = period.spent;
          el.income = period.income;
        }
      });
    });

    const incomeDoc = await DbIncomes.findOne({ dni });
    const expensesDoc = await DbExpenses.findOne({ dni });

    const spent = expensesDoc.expenses.reduce((acc, el) => acc + el.price, 0);

    list[currentMonth].spent = spent;
    list[currentMonth].income = incomeDoc.totalIncome;

    res.json(list);
  }
);

module.exports = router;
