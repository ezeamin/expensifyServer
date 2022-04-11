const express = require("express");
const router = express.Router();

const validar = require("../../helpers/validar");
const validarKeys = require("../../helpers/validarKeys");
const isAuthenticated = require("../../helpers/isAuthenticated");
const generarCodigo = require("../../helpers/generarCodigo");
const stringify = require("../../helpers/stringify");
const addNewMonth = require("../../helpers/addNewMonth");

const DbPayments = require("../../models/payment");
const editList = require("../../helpers/db/editList");

router.get("/api/payments", isAuthenticated, async (req, res) => {
  const dni = process.env.NODE_ENV === "test" ? "12345678" : req.user.dni;

  const document = await DbPayments.findOne({ dni });
  res.json(document);
});

router.put("/api/payment", isAuthenticated, async (req, res) => {
  if (!validar(req.body) || !validarKeys("newPayment", req.body)) {
    res.status(401).json({
      message: "Datos inválidos",
    });
    return;
  }

  //push new payment
  const dni = process.env.NODE_ENV === "test" ? req.body.dni : req.user.dni;

  const document = await DbPayments.findOne({ dni });

  if (!document) {
    res.status(401).json({
      message: "No existe el documento",
    });
    return;
  }

  document.payments.push({
    id: generarCodigo(8),
    title: stringify(req.body.title, true),
    categoryId: req.body.categoryId,
    accountId: req.body.accountId,
    date: new Date(),
    paymentDate: new Date(req.body.paymentDate),
    price: req.body.price,
    description: req.body.description,
  });

  document.save((err) => {
    if (err) {
      return res.status(401).json({
        err,
      });
    }

    res.status(200).json(document);
  });
});

router.put("/api/payment/pay/:id", isAuthenticated, async (req, res) => {
  if (!validar(req.body)) {
    res.status(401).json({
      message: "Datos inválidos",
    });
    return;
  }

  const dni = process.env.NODE_ENV === "test" ? "12345678" : req.user.dni;

  const document = await DbPayments.findOne({ dni });

  if (!document) {
    res.status(401).json({
      message: "No existe el documento",
    });
    return;
  }

  const paymentIndex = document.payments
    .map((x) => {
      return x.id;
    })
    .indexOf(req.params.id);

  if (paymentIndex === -1) {
    res.status(401).json({
      message: "No existe el pago",
    });
    return;
  }

  document.payments[paymentIndex].paymentDate = addNewMonth(
    document.payments[paymentIndex].paymentDate.toISOString().split("T")[0]
  );

  document.save((err) => {
    if (err) {
      return res.status(401).json({
        err,
      });
    }

    res.status(200).json(document);
  });
});

router.put("/api/payment/:id", isAuthenticated, async (req, res) => {
  if (!validar(req.body)) {
    res.status(401).json({
      message: "Datos inválidos",
    });
    return;
  }

  const dni = process.env.NODE_ENV === "test" ? req.body.dni : req.user.dni;

  editList("payment", dni, req.params.id, req.body, res);
});

router.delete("/api/payment/:id", isAuthenticated, (req, res) => {
  const dni = process.env.NODE_ENV === "test" ? "12345678" : req.user.dni;

  DbPayments.findOneAndUpdate(
    { dni },
    {
      $pull: {
        payments: {
          id: req.params.id,
        },
      },
    },
    { new: true },
    (err, payments) => {
      if (err) {
        return res.status(401).json({
          err,
        });
      }

      res.status(200).json(payments);
    }
  );
});

module.exports = router;
