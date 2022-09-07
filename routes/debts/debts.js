const express = require("express");
const router = express.Router();

const validar = require("../../helpers/validar");
const validarKeys = require("../../helpers/validarKeys");
const isAuthenticated = require("../../helpers/isAuthenticated");
const generarCodigo = require("../../helpers/generarCodigo");
const stringify = require("../../helpers/stringify");

const DbDebts = require("../../models/debt");
const DbAccounts = require("../../models/account");
const hashing = require("../../helpers/debtorHashing");
const formatDate = require("../../helpers/formatDate");

router.get("/api/debts/:type", isAuthenticated, async (req, res) => {
  const dni = process.env.NODE_ENV === "test" ? "12345678" : req.user.dni;
  const type = req.params.type;

  const document = await DbDebts.findOne({ dni });

  let userDebts = [];
  let otherDebts = [];

  if (type === "user") {
    userDebts = await Promise.all(
      document.userDebts.map(async (debtsTo) => {
        debtsTo = debtsTo.toObject();

        debtsTo.debts = await Promise.all(
          debtsTo.debts.map(async (debt) => {
            debt.date = formatDate(debt.date, debt.tzOffset);

            const accountsDoc = await DbAccounts.findOne({ dni });
            const account = accountsDoc.accounts.find(
              (acc) => acc.id === debt.originAccountId
            );

            debt.account = account.title;
            delete debt.originAccountId;

            return debt;
          })
        );

        debtsTo.total = debtsTo.debts.reduce(
          (debt, cur) => debt + cur.price,
          0
        );

        return debtsTo;
      })
    );
  } else {
    otherDebts = await Promise.all(
      document.otherDebts.map(async (debtor) => {
        debtor = debtor.toObject();

        debtor.debts = await Promise.all(
          debtor.debts.map(async (debt) => {
            debt.date = formatDate(debt.date, debt.tzOffset);

            const accountsDoc = await DbAccounts.findOne({ dni });
            const account = accountsDoc.accounts.find(
              (acc) => acc.id === debt.originAccountId
            );

            debt.account = account.title;
            delete debt.originAccountId;

            return debt;
          })
        );

        debtor.total = debtor.debts.reduce((debt, cur) => debt + cur.price, 0);

        return debtor;
      })
    );
  }

  if (type === "user") res.json(userDebts);
  else res.json(otherDebts);
});

router.get(
  "/api/debt/:type/:personId/:debtId",
  isAuthenticated,
  async (req, res) => {
    const dni = process.env.NODE_ENV === "test" ? "12345678" : req.user.dni;
    const type = req.params.type;
    const personId = req.params.personId;
    const debtId = req.params.debtId;

    const document = await DbDebts.findOne({ dni });

    let listName;
    if (type === "user") {
      listName = "userDebts";
    } else if (type === "other") {
      listName = "otherDebts";
    }

    const personDebt = document[listName].find((debt) => {
      return debt.id === personId;
    });

    const debt = personDebt.debts.find((debt) => {
      return debt.id === debtId;
    });

    return res.json(debt);
  }
);

router.get(
  "/api/debts/debtorsList/:type",
  isAuthenticated,
  async (req, res) => {
    const dni = process.env.NODE_ENV === "test" ? "12345678" : req.user.dni;
    const type = req.params.type;

    const document = await DbDebts.findOne({ dni });

    let listName;
    if (type === "user") {
      listName = "userDebts";
    } else if (type === "other") {
      listName = "otherDebts";
    }

    const debtorsList = document[listName].map((debt) => {
      return {
        id: debt.id,
        name: debt.name,
      };
    });

    return res.json(debtorsList);
  }
);

router.put("/api/debts/newDebtor/:type", isAuthenticated, async (req, res) => {
  const dni = process.env.NODE_ENV === "test" ? "12345678" : req.user.dni;
  const type = req.params.type;

  const document = await DbDebts.findOne({ dni });

  let listName;
  if (type === "user") {
    listName = "userDebts";
  } else if (type === "other") {
    listName = "otherDebts";
  }

  const newDebtor = {
    id: hashing(req.body.name),
    name: req.body.name,
    debts: [],
  };

  document[listName].push(newDebtor);

  await document.save();

  return res.json(newDebtor);
});

router.put("/api/debt/:type", isAuthenticated, async (req, res) => {
  const type = req.params.type; // "user" is own debts, "other" is other people's debts

  if (!validar(req.body) || !validarKeys("debt", req.body)) {
    res.status(401).json({
      message: "Datos inválidos",
    });
    return;
  }

  //push new debt
  const dni = process.env.NODE_ENV === "test" ? req.body.dni : req.user.dni;

  const document = await DbDebts.findOne({ dni });
  const accountsDoc = await DbAccounts.findOne({ dni });

  if (!document || !accountsDoc) {
    return res.status(404).json({
      message: "Error cargando deuda :P",
    });
  }

  // restar de cuenta de origen (case "other")
  if (type === "other") {
    const accountIndex = accountsDoc.accounts.findIndex(
      (acc) => acc.id === req.body.accountId
    );

    if (accountIndex === -1) {
      return res.status(404).json({
        message: "Error cargando deuda :P",
      });
    }

    if (!accountsDoc.accounts[accountIndex].noBalance) {
      accountsDoc.accounts[accountIndex].balance -= req.body.price;
    }

    await accountsDoc.save();
  }

  if (type === "user") {
    // deuda propia
    let index = document.userDebts.findIndex((x) => x.id === req.body.nameId);

    document.userDebts[index].debts.push({
      id: generarCodigo(8),
      destinationAccountId: req.body.accountId,
      date: req.body.date,
      tzOffset: req.body.tzOffset,
      price: req.body.price,
      description: req.body.description.trim(),
      title: req.body.title.trim(),
    });

    const total = Number(document.totalUserDebt) + Number(req.body.price);

    document.totalUserDebt = total;
  } else {
    //deuda ajena
    let index = document.otherDebts.findIndex((x) => x.id === req.body.nameId);

    document.otherDebts[index].debts.push({
      id: generarCodigo(8),
      originAccountId: req.body.accountId,
      date: req.body.date,
      price: req.body.price,
      description: req.body.description.trim(),
      tzOffset: req.body.tzOffset,
      title: req.body.title.trim(),
    });

    const total = Number(document.totalOtherDebt) + Number(req.body.price);

    document.totalOtherDebt = total;
  }

  await document.save((err) => {
    if (err) {
      return res.status(401).json({
        err,
      });
    }

    res.status(200).json(document);
  });
});

//actualizar deuda
router.put(
  "/api/debt/:type/:personId/:debtId",
  isAuthenticated,
  async (req, res) => {
    if (!validar(req.body)) {
      res.status(401).json({
        message: "Datos inválidos",
      });
      return;
    }

    const dni = process.env.NODE_ENV === "test" ? req.body.dni : req.user.dni;
    const type = req.params.type;

    DbDebts.findOne({ dni }, (err, document) => {
      if (err) {
        return res.status(401).json({
          err,
        });
      }

      let personIndex, debtIndex;

      try {
        if (type === "user") {
          personIndex = document.userDebts
            .map((x) => {
              return x.id;
            })
            .indexOf(req.params.personId);
          debtIndex = document.userDebts[personIndex].debts
            .map((x) => {
              return x.id;
            })
            .indexOf(req.params.debtId);

          if (personIndex === -1 || debtIndex === -1) {
            return res
              .status(401)
              .json({ message: "No existe el deudor o el prestamo" });
          }

          document.userDebts[personIndex].debts[debtIndex].set(req.body);
        } else {
          personIndex = document.otherDebts
            .map((x) => {
              return x.id;
            })
            .indexOf(req.params.personId);
          debtIndex = document.otherDebts[personIndex].debts
            .map((x) => {
              return x.id;
            })
            .indexOf(req.params.debtId);

          if (personIndex === -1 || debtIndex === -1) {
            return res
              .status(401)
              .json({ message: "No existe el deudor o el prestamo" });
          }

          document.otherDebts[personIndex].debts[debtIndex].set(req.body);

          if (document.otherDebts[personIndex].debts.length === 0) {
            document.otherDebts.splice(personIndex, 1);
          }
        }
      } catch (err) {
        return res.status(401).json(err);
      }

      //restar del total y agregar/quitar de cuenta

      document.save((err) => {
        if (err) {
          return res.status(401).json({
            err,
          });
        }

        res.status(200).json(document);
      });
    });
  }
);

// eliminar deuda (saldar?)
router.delete(
  "/api/debt/:type/:personId/:debtId/:action",
  isAuthenticated,
  (req, res) => {
    const dni = process.env.NODE_ENV === "test" ? "12345678" : req.user.dni;
    const type = req.params.type;
    const personId = req.params.personId;
    const debtId = req.params.debtId;
    const action = req.params.action;

    const list = type === "user" ? "userDebts" : "otherDebts";

    DbDebts.findOne({ dni }, async (err, document) => {
      if (err) {
        return res.status(401).json({
          err,
        });
      }

      let personIndex, debtIndex;

      personIndex = document[list].findIndex((x) => x.id === personId);
      debtIndex = document[list][personIndex].debts.findIndex(
        (x) => x.id === debtId
      );

      if (personIndex === -1 || debtIndex === -1) {
        return res
          .status(401)
          .json({ message: "No existe el deudor o el prestamo" });
      }

      const debt = document[list][personIndex].debts[debtIndex];

      document[list][personIndex].debts.splice(debtIndex, 1);

      if (document[list][personIndex].debts.length === 0) {
        document[list].splice(personIndex, 1);
      }

      if (type === "user") {
        document.totalUserDebt -= debt.price;
      } else {
        document.totalOtherDebt -= debt.price;

        if (action === "saldar") {
          const accountsDoc = await DbAccounts.findOne({ dni });
          const accountIndex = accountsDoc.accounts.findIndex(
            (acc) => acc.id === debt.originAccountId
          );

          accountsDoc.accounts[accountIndex].balance += debt.price;

          await accountsDoc.save();
        }
      }

      document.save((err) => {
        if (err) {
          return res.status(401).json({
            err,
          });
        }

        res.status(200).json(document);
      });
    });
  }
);

module.exports = router;
