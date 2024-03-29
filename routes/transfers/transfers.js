const express = require("express");
const router = express.Router();

const validar = require("../../helpers/validar");
const validarKeys = require("../../helpers/validarKeys");
const isAuthenticated = require("../../helpers/isAuthenticated");
const generarCodigo = require("../../helpers/generarCodigo");

const DbTransfers = require("../../models/transfer");
const DbAccounts = require("../../models/account");
const DbOlds = require("../../models/period");
// const editList = require("../../helpers/db/editList");
const formatDate = require("../../helpers/formatDate");
const roundToTwo = require("../../helpers/roundToTwo");

router.get("/api/transfers", isAuthenticated, async (req, res) => {
  const dni = process.env.NODE_ENV === "test" ? "12345678" : req.user.dni;

  const document = await DbTransfers.findOne({ dni });
  const transfers = document.transfers.map((transfer) => {
    transfer.date = formatDate(transfer.date, transfer.tzOffset);

    return transfer;
  });

  document.transfers = transfers;
  res.json(document);
});

router.get(
  "/api/transfers/listTransform/:year/:periodId",
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

    periodDoc.transfers.sort((a, b) => {
      return b.date - a.date;
    });

    const transfers = periodDoc.transfers.map((transfer) => {
      let originAccount = accounts.find(
        (account) => account.id === transfer.originAccountId
      );

      let destinationAccount = accounts.find(
        (account) => account.id === transfer.destinationAccountId
      );

      let date = formatDate(transfer.date, transfer.tzOffset);

      if (!originAccount) {
        originAccount = {
          title: "DELETED",
          color: "#ccc",
        };
      }

      if (!destinationAccount) {
        destinationAccount = {
          title: "DELETED",
          color: "#ccc",
        };
      }

      return {
        id: transfer.id,
        price: transfer.price,
        date: date.day,
        time: date.time,
        originAccount: originAccount.title,
        originAccountColor: originAccount.color,
        destinationAccount: destinationAccount.title,
        destinationAccountColor: destinationAccount.color,
        description: transfer.description,
      };
    });
    return res.json(transfers);
  }
);

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

  // relations

  const price = roundToTwo(req.body.price);

  const accountDocument = await DbAccounts.findOne({ dni });

  const originAccountIndex = accountDocument.accounts.findIndex(
    (account) => account.id === req.body.originAccountId
  );
  const destinationAccountIndex = accountDocument.accounts.findIndex(
    (account) => account.id === req.body.destinationAccountId
  );

  if (
    accountDocument.accounts[destinationAccountIndex].noBalance ||
    accountDocument.accounts[originAccountIndex].noBalance
  ) {
    return res.status(401).json({
      message:
        "No se puede transferir desde/hacia una cuenta sin saldo alterable (crédito por ejemplo)",
    });
  }

  if (accountDocument.accounts[originAccountIndex].balance < price) {
    return res.status(401).json({
      message: "No hay suficiente saldo en la cuenta de origen seleccionada",
    });
  }

  accountDocument.accounts[originAccountIndex].balance =
    accountDocument.accounts[originAccountIndex].balance - price;
  accountDocument.accounts[destinationAccountIndex].balance =
    accountDocument.accounts[destinationAccountIndex].balance + price;

  await accountDocument.save();

  // saving transfer

  document.transfers.push({
    id: generarCodigo(8),
    originAccountId: req.body.originAccountId,
    destinationAccountId: req.body.destinationAccountId,
    date: req.body.date,
    tzOffset: req.body.tzOffset,
    price: price,
    description: req.body.description.trim(),
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

router.get(
  "/api/transfers/listTransform",
  isAuthenticated,
  async (req, res) => {
    const dni = process.env.NODE_ENV === "test" ? "12345678" : req.user.dni;

    let document = await DbTransfers.findOne({ dni });
    const accounts = await DbAccounts.findOne({ dni });

    document.transfers.sort((a, b) => {
      return b.date - a.date;
    });

    const transfers = document.transfers.map((transfer) => {
      let originAccount = accounts.accounts.find(
        (account) => account.id === transfer.originAccountId
      );

      let destinationAccount = accounts.accounts.find(
        (account) => account.id === transfer.destinationAccountId
      );

      let date = formatDate(transfer.date, transfer.tzOffset);

      if (!originAccount) {
        originAccount = {
          title: "DELETED",
          color: "#ccc",
        };
      }

      if (!destinationAccount) {
        destinationAccount = {
          title: "DELETED",
          color: "#ccc",
        };
      }

      return {
        id: transfer.id,
        price: transfer.price,
        date: date.day,
        time: date.time,
        originAccount: originAccount.title,
        originAccountColor: originAccount.color,
        destinationAccount: destinationAccount.title,
        destinationAccountColor: destinationAccount.color,
        description: transfer.description,
      };
    });
    return res.json(transfers);
  }
);

// router.put("/api/transfer/:id", isAuthenticated, async (req, res) => {
//   if (!validar(req.body)) {
//     res.status(401).json({
//       message: "Datos inválidos",
//     });
//     return;
//   }

//   const dni = process.env.NODE_ENV === "test" ? req.body.dni : req.user.dni;

//   editList("transfer", dni, req.params.id, req.body, res);
// });

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
