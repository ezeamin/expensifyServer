const express = require("express");
const router = express.Router();

const validar = require("../../helpers/validar");
const validarKeys = require("../../helpers/validarKeys");
const isAuthenticated = require("../../helpers/isAuthenticated");
const generarCodigo = require("../../helpers/generarCodigo");
const stringify = require("../../helpers/stringify");

const DbExpenses = require("../../models/expense");
const editList = require("../../helpers/db/editList");

router.get("/api/expenses", isAuthenticated, async (req, res) => {
  const dni = process.env.NODE_ENV === "test" ? "12345678" : req.user.dni;

  const document = await DbExpenses.findOne({ dni });
  res.json(document);
});

router.put("/api/expense", isAuthenticated, async (req, res) => {
  if (!validar(req.body) || !validarKeys("newExpense", req.body)) {
    res.status(401).json({
      message: "Datos inválidos",
    });
    return;
  }

  //push new expense
  const dni = process.env.NODE_ENV === "test" ? req.body.dni : req.user.dni;

  const document = await DbExpenses.findOne({ dni });

  if (!document) {
    res.status(401).json({
      message: "No existe el documento",
    });
    return;
  }

  document.expenses.push({
    id: generarCodigo(8),
    title: stringify(req.body.title, true),
    categoryId: req.body.categoryId,
    accountId: req.body.accountId,
    date: new Date(),
    price: req.body.price,
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
