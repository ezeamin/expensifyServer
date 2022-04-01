const express = require("express");
const router = express.Router();

const validar = require("../../helpers/validar");
const validarKeys = require("../../helpers/validarKeys");
const isAuthenticated = require("../../helpers/isAuthenticated");
const generarCodigo = require("../../helpers/generarCodigo");
const stringify = require("../../helpers/stringify");

const DbAccounts = require("../../models/account");

router.get("/api/accounts", isAuthenticated, async (req, res) => {
  const dni = process.env.NODE_ENV === "test" ? "12345678" : req.user.dni;

  const accounts = await DbAccounts.find({ dni });
  res.json(accounts);
});

router.post("/api/account", isAuthenticated, (req, res) => {
  if (!validar(req.body) || !validarKeys("newAccount", req.body)) {
    res.status(401).json({
      message: "Datos inválidos",
    });
    return;
  }

  const account = new DbAccounts({
    dni: process.env.NODE_ENV === "test" ? req.body.dni : req.user.dni,
    spent: 0,
    accounts: [
      {
        id: generarCodigo(8),
        title: stringify(req.body.title, false),
        icon: req.body.icon,
        color: req.body.color,
        accountType: req.body.accountType,
        balance: req.body.balance,
        spent: 0,
        description: req.body.description,
      },
    ],
  });

  account.save((err) => {
    if (err) {
      return res.status(401).json({
        err,
      });
    }

    res.status(200).json(account);
  });
});

router.put("/api/account", isAuthenticated, (req, res) => {
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

  DbAccounts.findOne(
    {
      dni: process.env.NODE_ENV === "test" ? req.body.dni : req.user.dni,
    },
    (err, account) => {
      if (err) {
        return res.status(401).json({
          err,
        });
      }

      let accountPosition = account.accounts.findIndex(
        (account) => account.id === req.params.id
      );

      account.accounts[accountPosition].set(req.body);

      account.save((err) => {
        if (err) {
          return res.status(401).json({
            err,
          });
        }

        res.status(200).json(account);
      });
    }
  );
});

//reset all spent
router.put("/api/accounts/reset", isAuthenticated, (req, res) => {
    DbAccounts.findOne(
        {
        dni: process.env.NODE_ENV === "test" ? req.body.dni : req.user.dni,
        },
        (err, account) => {
        if (err) {
            return res.status(401).json({
            err,
            });
        }
    
        account.accounts.forEach((account) => {
            account.spent = 0;
        });
    
        account.save((err) => {
            if (err) {
            return res.status(401).json({
                err,
            });
            }
    
            res.status(200).json(account);
        });
        }
    );
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
