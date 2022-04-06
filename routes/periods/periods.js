const express = require("express");
const router = express.Router();

const validar = require("../../helpers/validar");
const validarKeys = require("../../helpers/validarKeys");
const isAuthenticated = require("../../helpers/isAuthenticated");
//const addNewMonth = require("../../helpers/addNewMonth");

const DbPeriod = require("../../models/period");

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
  const period = req.body;

  const keys = ["incomes", "expenses", "transfers"];
  const nameKeys = ["newIncome", "newExpense", "newTransfer"];

  if (!validar(period) || !validarKeys("newPeriod", period)) {
    return res.status(401).json({
      message: "Datos inválidos",
    });
  }

  for (let i = 0; i < keys.length; i++) {
    for (let j = 0; j < period[keys[i]].length; j++) {
      if (
        !validar(period[keys[i]][j]) ||
        !validarKeys(nameKeys[i], period[keys[i]][j])
      ) {
        return res.status(401).json({
          message: "Datos inválidos",
        });
      }
    }
  }

  const old = await DbPeriod.findOne({ dni });
  if (!old) {
    return res.status(404).json({
      message: "No existe el documento",
    });
  }

  const newPeriod = {
    start: new Date(period.start),
    end: new Date(period.end),
    days: period.days,
    spent: period.spent,
    income: period.income,
    incomes: period.incomes,
    expenses: period.expenses,
    transfers: period.transfers,
  };

  old.periods.push(newPeriod);

  old.save((err) => {
    if (err) {
      return res.status(500).json({
        message: "Error al guardar",
        err,
      });
    }

    return res.status(200).json(old);
  });
});

module.exports = router;
