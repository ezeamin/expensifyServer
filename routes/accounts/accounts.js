const express = require("express");
const router = express.Router();

const validar = require("../../helpers/validar");
const validarKeys = require("../../helpers/validarKeys");
const isAuthenticated = require("../../helpers/isAuthenticated");
const generarCodigo = require("../../helpers/generarCodigo");
const stringify = require("../../helpers/stringify");

const DbAccounts = require("../../models/account");
const editList = require("../../helpers/db/editList");
const resetSpent = require("../../helpers/db/resetSpent");
const generateColor = require("../../helpers/generateColor");
const dataSorterByTitle = require("../../helpers/dataSorterByTitle");

router.get("/api/accounts", isAuthenticated, async (req, res) => {
  const dni = process.env.NODE_ENV === "test" ? "12345678" : req.user.dni;

  const accounts = await DbAccounts.findOne({ dni });
  const sortedAccounts = accounts.accounts.sort(dataSorterByTitle);

  res.json({ accounts: sortedAccounts });
});

router.get("/api/accounts/spentAndList", isAuthenticated, async (req, res) => {
  const dni = process.env.NODE_ENV === "test" ? "12345678" : req.user.dni;

  const accounts = await DbAccounts.findOne({ dni });
  const spent = Number.parseFloat(
    accounts.accounts.reduce((acc, cur) => acc + cur.spent, 0)
  );

  const accountsList = accounts.accounts.map((acc) => ({
    title: acc.title,
    spent: acc.spent,
    mean: Math.round((Number.parseFloat(acc.spent) * 100) / spent || 0),
  }));

  accountsList.sort((a, b) => b.spent - a.spent);
  res.json({ spent, accountsList } || { spent: 0, accountsList: [] });
});

router.get("/api/account/:id", isAuthenticated, async (req, res) => {
  const id = req.params.id;
  const dni = process.env.NODE_ENV === "test" ? "12345678" : req.user.dni;

  const accounts = await DbAccounts.findOne({ dni });
  const account = accounts.accounts.find((account) => account.id === id);

  res.json(account);
});

router.get("/api/accounts/limit", isAuthenticated, async (req, res) => {
  const dni = process.env.NODE_ENV === "test" ? "12345678" : req.user.dni;

  const accountsDoc = await DbAccounts.findOne({ dni });

  res.json({ limit: accountsDoc.generalLimit });
});

router.put("/api/account", isAuthenticated, async (req, res) => {
  req.body.color = generateColor();

  if (!validar(req.body) || !validarKeys("newAccount", req.body)) {
    res.status(401).json({
      message: "Datos inválidos",
    });
    return;
  }

  const accountDoc = await DbAccounts.findOne({ dni: req.user.dni });
  const existingAccount = accountDoc.accounts.filter(
    (acc) =>
      acc.title.trim().toLowerCase() === req.body.title.trim().toLowerCase()
  )[0];

  console.log(existingAccount);
  if (existingAccount) {
    res.status(401).json({
      message: "Ya existe una cuenta con este nombre",
    });
    return;
  }

  DbAccounts.findOneAndUpdate(
    { dni: process.env.NODE_ENV === "test" ? req.body.dni : req.user.dni },
    {
      $push: {
        accounts: {
          id: generarCodigo(8),
          title: stringify(req.body.title, false),
          icon: req.body.icon,
          color: req.body.color,
          accountType: req.body.accountType,
          balance: req.body.balance,
          spent: 0,
          description: req.body.description,
          noBalance: Number.parseFloat(req.body.balance) === 0,
        },
      },
    },
    { new: true },
    (err, account) => {
      if (err) {
        return res.status(401).json({
          err,
        });
      }

      res.status(200).json(account);
    }
  );
});

router.put("/api/account/generalLimit", isAuthenticated, async (req, res) => {
  if (!validar(req.body) || !validarKeys("newLimit", req.body)) {
    res.status(401).json({
      message: "Datos inválidos",
    });
    return;
  }

  DbAccounts.findOneAndUpdate(
    { dni: process.env.NODE_ENV === "test" ? req.body.dni : req.user.dni },
    {
      generalLimit: req.body.limit,
    },
    { new: true },
    (err, account) => {
      if (err) {
        return res.status(401).json({
          err,
        });
      }

      res.status(200).json(account);
    }
  );
});

router.put("/api/account/:id", isAuthenticated, (req, res) => {
  if (!validar(req.body)) {
    res.status(401).json({
      message: "Datos inválidos",
    });
    return;
  }

  const dni = process.env.NODE_ENV === "test" ? "12345678" : req.user.dni;

  editList("account", dni, req.params.id, req.body, res);
});

//reset all spent
router.put("/api/accounts/reset", isAuthenticated, (req, res) => {
  const dni = process.env.NODE_ENV === "test" ? "12345678" : req.user.dni;

  resetSpent("account", dni, res);
});

router.delete("/api/account/:id", isAuthenticated, (req, res) => {
  const dni = process.env.NODE_ENV === "test" ? "12345678" : req.user.dni;

  DbAccounts.findOneAndUpdate(
    { dni },
    {
      $pull: {
        accounts: {
          id: req.params.id,
        },
      },
    },
    { new: true },
    (err, account) => {
      if (err) {
        return res.status(401).json({
          err,
        });
      }

      res.status(200).json(account);
    }
  );
});

module.exports = router;
