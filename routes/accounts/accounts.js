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

router.get("/api/accounts", isAuthenticated, async (req, res) => {
  const dni = process.env.NODE_ENV === "test" ? "12345678" : req.user.dni;

  const accounts = await DbAccounts.findOne({ dni });
  res.json(accounts);
});

router.get("/api/account/:id", isAuthenticated, async (req, res) => {
  const id = req.params.id;
  const dni = process.env.NODE_ENV === "test" ? "12345678" : req.user.dni;

  const accounts = await DbAccounts.findOne({ dni });
  const account = accounts.accounts.find((account) => account.id === id);

  res.json(account);
});

router.put("/api/account", isAuthenticated, (req, res) => {
  req.body.color = generateColor();

  if (!validar(req.body) || !validarKeys("newAccount", req.body)) {
    res.status(401).json({
      message: "Datos inválidos",
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
