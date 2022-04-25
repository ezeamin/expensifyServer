const express = require("express");
const router = express.Router();

const validar = require("../../helpers/validar");
const validarKeys = require("../../helpers/validarKeys");
const isAuthenticated = require("../../helpers/isAuthenticated");
const generarCodigo = require("../../helpers/generarCodigo");
const stringify = require("../../helpers/stringify");

const DbExpenses = require("../../models/expense");
const DBCategories = require("../../models/category");
const DbAccounts = require("../../models/account");
const editList = require("../../helpers/db/editList");
const formatDate = require("../../helpers/formatDate");
const roundToTwo = require("../../helpers/roundToTwo");

router.get("/api/expenses", isAuthenticated, async (req, res) => {
  const dni = process.env.NODE_ENV === "test" ? "12345678" : req.user.dni;

  const document = await DbExpenses.findOne({ dni });
  res.json(document);
});

router.get("/api/expenses/listTransform", isAuthenticated, async (req, res) => {
  const dni = process.env.NODE_ENV === "test" ? "12345678" : req.user.dni;

  let document = await DbExpenses.findOne({ dni });
  const categories = await DBCategories.findOne({ dni });
  const accounts = await DbAccounts.findOne({ dni });

  document.expenses.sort((a, b) => {
    return b.date - a.date;
  });

  const expenses = document.expenses.map((expense) => {
    const category = categories.categories.find(
      (category) => category.id === expense.categoryId
    );

    const account = accounts.accounts.find(
      (account) => account.id === expense.accountId
    );

    let date = formatDate(expense.date);

    return {
      id: expense.id,
      title: expense.title,
      price: expense.price,
      date: date.day,
      time: date.time,
      category: category.title,
      icon: category.icon,
      color: category.color,
      account: account.title,
      accountColor: account.color,
      description: expense.description,
    };
  });
  return res.json(expenses);
});

router.put("/api/expense", isAuthenticated, async (req, res) => {
  if (!validar(req.body) || !validarKeys("newExpense", req.body)) {
    res.status(401).json({
      message: "Datos inválidos",
    });
    return;
  }

  //push new expense

  const dni = process.env.NODE_ENV === "test" ? "12345678" : req.user.dni;
  const document = await DbExpenses.findOne({ dni });

  if (!document) {
    res.status(401).json({
      message: "No existe el documento",
    });
    return;
  }

  // relations

  const price = roundToTwo(req.body.price);

  const accountDocument = await DbAccounts.findOne({ dni });
  const categoryDocument = await DBCategories.findOne({ dni });

  const accountIndex = accountDocument.accounts.findIndex(
    (account) => account.id === req.body.accountId
  );

  const categoryIndex = categoryDocument.categories.findIndex(
    (category) => category.id === req.body.categoryId
  );

  if(!accountDocument.accounts[accountIndex].noBalance){
    if(accountDocument.accounts[accountIndex].balance < price){
      return res.status(401).json({
        message: "No hay suficiente saldo en la cuenta seleccionada",
      });
    }

    const newBalance = accountDocument.accounts[accountIndex].balance - price;
    accountDocument.accounts[accountIndex].balance = newBalance;

    accountDocument.spent += price;
    accountDocument.generalBalance -= price;

    await accountDocument.save();
  }

  categoryDocument.categories[categoryIndex].spent += price;
  await categoryDocument.save();

  // saving expense

  document.expenses.push({
    id: generarCodigo(8),
    title: stringify(req.body.title, true),
    categoryId: req.body.categoryId,
    accountId: req.body.accountId,
    date: new Date(),
    price: price,
    description: req.body.description,
  });

  await document.save((err) => {
    if (err) {
      return res.status(401).json({
        err,
      });
    }

    res.status(200).json(document);
  });
});

router.put("/api/expense/:id", isAuthenticated, async (req, res) => {
  if (!validar(req.body)) {
    res.status(401).json({
      message: "Datos inválidos",
    });
    return;
  }

  const dni = process.env.NODE_ENV === "test" ? req.body.dni : req.user.dni;

  editList("expense", dni, req.params.id, req.body, res);
});

router.delete("/api/expense/:id", isAuthenticated, (req, res) => {
  const dni = process.env.NODE_ENV === "test" ? "12345678" : req.user.dni;

  DbExpenses.findOneAndUpdate(
    { dni },
    {
      $pull: {
        expenses: {
          id: req.params.id,
        },
      },
    },
    { new: true },
    (err, expenses) => {
      if (err) {
        return res.status(401).json({
          err,
        });
      }

      res.status(200).json(expenses);
    }
  );
});

module.exports = router;
