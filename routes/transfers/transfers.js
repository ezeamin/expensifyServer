const express = require("express");
const router = express.Router();

const validar = require("../../helpers/validar");
const validarKeys = require("../../helpers/validarKeys");
const isAuthenticated = require("../../helpers/isAuthenticated");
const generarCodigo = require("../../helpers/generarCodigo");

const DbTransfers = require("../../models/transfer");
const editList = require("../../helpers/db/editList");

router.get("/api/transfers", isAuthenticated, async (req, res) => {
  const dni = process.env.NODE_ENV === "test" ? "12345678" : req.user.dni;

  const document = await DbTransfers.findOne({ dni });
  res.json(document);
});

router.put("/api/transfer", isAuthenticated, async (req, res) => {
  if (!validar(req.body) || !validarKeys("newTransfer", req.body)) {
    res.status(401).json({
      message: "Datos inválidos",
    });
    return;
  }

  //push new transfer
  const dni = process.env.NODE_ENV === "test" ? req.body.dni : req.user.dni;

  const document = await DbTransfers.findOne({ dni });

  if (!document) {
    res.status(401).json({
      message: "No existe el documento",
    });
    return;
  }

  document.transfers.push({
    id: generarCodigo(8),
    originAccountId: req.body.originAccountId,
    destinationAccountId: req.body.destinationAccountId,
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

router.put("/api/transfer/:id", isAuthenticated, async (req, res) => {
  if (!validar(req.body)) {
    res.status(401).json({
      message: "Datos inválidos",
    });
    return;
  }

  const dni = process.env.NODE_ENV === "test" ? req.body.dni : req.user.dni;

  editList("transfer", dni, req.params.id, req.body, res);
});

router.delete("/api/transfer/:id", isAuthenticated, (req, res) => {
  const dni = process.env.NODE_ENV === "test" ? "12345678" : req.user.dni;

  DbTransfers.findOneAndUpdate(
    { dni },
    {
      $pull: {
        transfers: {
          id: req.params.id,
        },
      },
    },
    { new: true },
    (err, transfers) => {
      if (err) {
        return res.status(401).json({
          err,
        });
      }

      res.status(200).json(transfers);
    }
  );
});

module.exports = router;
