const express = require("express");
const router = express.Router();

const validar = require("../../helpers/validar");
const validarKeys = require("../../helpers/validarKeys");
const isAuthenticated = require("../../helpers/isAuthenticated");
const generarCodigo = require("../../helpers/generarCodigo");
const stringify = require("../../helpers/stringify");

const DbIncomes = require("../../models/income");
const DbAccounts = require("../../models/account");
const DbOlds = require("../../models/period");
const editList = require("../../helpers/db/editList");
const formatDate = require("../../helpers/formatDate");
const roundToTwo = require("../../helpers/roundToTwo");
const updateAccountValues = require("../../helpers/db/updateAccountValues");

router.get("/api/incomes", isAuthenticated, async (req, res) => {
  const dni = process.env.NODE_ENV === "test" ? "12345678" : req.user.dni;

  const document = await DbIncomes.findOne({ dni });

  const incomes = document.incomes.map((income) => {
    income.date = formatDate(income.date, income.tzOffset);

    return income;
  });

  document.incomes = incomes;
  res.json(document);
});

router.get(
  "/api/incomes/listTransform/:year/:periodId",
  isAuthenticated,
  async (req, res) => {
    const dni = process.env.NODE_ENV === "test" ? "12345678" : req.user.dni;
    const periodId = req.params.periodId;
    const year = req.params.year;

    const document = await DbOlds.findOne({ dni });
    const periodYearDoc = document.periods.find((period) => {
      return period.year === Number(year);
    });
    const periodDoc = periodYearDoc.periods.find(
      (period) => period.id === periodId
    );

    const accounts = periodDoc.accounts;

    periodDoc.incomes.sort((a, b) => {
      return b.date - a.date;
    });

    const incomes = periodDoc.incomes.map((income) => {
      const account = accounts.find(
        (account) => account.id === income.accountId
      );

      let date = formatDate(income.date, income.tzOffset);

      return {
        id: income.id,
        title: income.title,
        price: income.price,
        date: date.day,
        time: date.time,
        account: account.title,
        accountColor: account.color,
        description: income.description,
      };
    });
    return res.json(incomes);
  }
);

router.get("/api/income/:id", isAuthenticated, async (req, res) => {
  const id = req.params.id;
  const dni = process.env.NODE_ENV === "test" ? "12345678" : req.user.dni;

  const document = await DbIncomes.findOne({ dni });
  const income = document.incomes.find((income) => income.id === id);

  const data = {
    title: income.title,
    price: income.price,
    description: income.description,
    date: income.date,
    accountId: income.accountId,
    tzOffset: income.tzOffset,
  };

  res.json(data);
});

router.put("/api/income", isAuthenticated, async (req, res) => {
  if (!validar(req.body) || !validarKeys("newIncome", req.body)) {
    res.status(401).json({
      message: "Datos inválidos",
    });
    return;
  }

  //push new income
  const dni = process.env.NODE_ENV === "test" ? req.body.dni : req.user.dni;

  const document = await DbIncomes.findOne({ dni });

  if (!document) {
    res.status(401).json({
      message: "No existe el documento",
    });
    return;
  }

  // relations

  const price = roundToTwo(req.body.price);

  const accountDocument = await DbAccounts.findOne({ dni });

  const accountIndex = accountDocument.accounts.findIndex(
    (account) => account.id === req.body.accountId
  );

  if (!accountDocument.accounts[accountIndex].noBalance) {
    const newBalance = accountDocument.accounts[accountIndex].balance + price;
    accountDocument.accounts[accountIndex].balance = newBalance;

    await accountDocument.save();
  } else {
    res.status(401).json({
      message: "No se puede agregar saldo a una cuenta tipo crédito",
    });
    return;
  }

  // saving income

  document.incomes.push({
    id: generarCodigo(8),
    title: stringify(req.body.title, true),
    accountId: req.body.accountId,
    date: req.body.date,
    price: price,
    description: req.body.description.trim(),
    tzOffset: req.body.tzOffset,
  });

  document.totalIncome += price;

  await document.save((err) => {
    if (err) {
      return res.status(401).json({
        err,
      });
    }

    res.status(200).json(document);
  });
});

router.get("/api/incomes/listTransform", isAuthenticated, async (req, res) => {
  const dni = process.env.NODE_ENV === "test" ? "12345678" : req.user.dni;

  let document = await DbIncomes.findOne({ dni });
  const accounts = await DbAccounts.findOne({ dni });

  document.incomes.sort((a, b) => {
    return b.date - a.date;
  });

  const incomes = document.incomes.map((income) => {
    const account = accounts.accounts.find(
      (account) => account.id === income.accountId
    );

    let date = formatDate(income.date, income.tzOffset);

    return {
      id: income.id,
      title: income.title,
      price: income.price,
      date: date.day,
      time: date.time,
      account: account.title,
      accountColor: account.color,
      description: income.description,
    };
  });
  return res.json(incomes);
});

router.put("/api/income/:id", isAuthenticated, async (req, res) => {
  if (!validar(req.body.new)) {
    res.status(401).json({
      message: "Datos inválidos",
    });
    return;
  }

  const dni = process.env.NODE_ENV === "test" ? req.body.dni : req.user.dni;

  editList("income", dni, req.params.id, req.body, res);
});

router.delete("/api/income/:id", isAuthenticated, async (req, res) => {
  const dni = process.env.NODE_ENV === "test" ? "12345678" : req.user.dni;

  const document = await DbAccounts.findOne({ dni });
  const oldData = document.accounts.find(
    (account) => account.id === req.params.id
  );

  DbIncomes.findOneAndUpdate(
    { dni },
    {
      $pull: {
        incomes: {
          id: req.params.id,
        },
      },
    },
    { new: true },
    (err, incomes) => {
      if (err) {
        return res.status(401).json({
          err,
        });
      }

      if (document.accountId) updateAccountValues(dni, oldData, "account");
      res.status(200).json(incomes);
    }
  );
});

module.exports = router;
