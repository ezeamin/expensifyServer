const express = require("express");
const router = express.Router();

const validar = require("../../helpers/validar");
const validarKeys = require("../../helpers/validarKeys");
const isAuthenticated = require("../../helpers/isAuthenticated");
const generarCodigo = require("../../helpers/generarCodigo");
const stringify = require("../../helpers/stringify");

const DbIncomes = require("../../models/income");
const editList = require("../../helpers/db/editList");

router.get("/api/incomes", isAuthenticated, async (req, res) => {
  const dni = process.env.NODE_ENV === "test" ? "12345678" : req.user.dni;

  const document = await DbIncomes.findOne({ dni });
  res.json(document);
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

  document.incomes.push({
    id: generarCodigo(8),
    title: stringify(req.body.title, true),
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

router.put("/api/income/:id", isAuthenticated, async (req, res) => {
  if (!validar(req.body)) {
    res.status(401).json({
      message: "Datos inválidos",
    });
    return;
  }

  const dni = process.env.NODE_ENV === "test" ? req.body.dni : req.user.dni;

  editList("income", dni, req.params.id, req.body, res);
});

router.delete("/api/income/:id", isAuthenticated, (req, res) => {
  const dni = process.env.NODE_ENV === "test" ? "12345678" : req.user.dni;

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

      res.status(200).json(incomes);
    }
  );
});

module.exports = router;
