const express = require("express");
const router = express.Router();

const validar = require("../../helpers/validar");
const validarKeys = require("../../helpers/validarKeys");
const isAuthenticated = require("../../helpers/isAuthenticated");
const generarCodigo = require("../../helpers/generarCodigo");
const stringify = require("../../helpers/stringify");

const DbDebts = require("../../models/debt");
const hashing = require("../../helpers/debtorHashing");
const formatDate = require("../../helpers/formatDate");

router.get("/api/debts", isAuthenticated, async (req, res) => {
  const dni = process.env.NODE_ENV === "test" ? "12345678" : req.user.dni;

  const document = await DbDebts.findOne({ dni });
  const userDebts = document.userDebts.map((debt) => {
    debt.date = formatDate(debt.date, debt.tzOffset);

    return debt;
  });
  const otherDebts = document.otherDebts.map((debt) => {
    debt.date = formatDate(debt.date, debt.tzOffset);

    return debt;
  });

  document.userDebts = userDebts;
  document.otherDebts = otherDebts;
  res.json(document);
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

  if (
    !validar(req.body) ||
    !validarKeys(type === "user" ? "newUserDebt" : "newOtherDebt", req.body)
  ) {
    res.status(401).json({
      message: "Datos inválidos",
    });
    return;
  }

  //push new debt
  const dni = process.env.NODE_ENV === "test" ? req.body.dni : req.user.dni;

  const document = await DbDebts.findOne({ dni });

  if (!document) {
    res.status(401).json({
      message: "No existe el documento",
    });
    return;
  }

  const hashedCode = hashing(req.body.name);

  if (type === "user") {
    if (document.userDebts.some((obj) => obj.id === hashedCode)) {
      // ya existe el prestador
      let index = document.userDebts
        .map((x) => {
          return x.id;
        })
        .indexOf(hashedCode);

      document.userDebts[index].debts.push({
        id: generarCodigo(8),
        destinationAccountId: req.body.destinationAccountId,
        date: req.body.date,
        tzOffset: req.body.tzOffset,
        price: req.body.price,
        description: req.body.description.trim(),
        title: req.body.title.trim(),
      });
    } else {
      // primer prestamo de este prestador
      document.userDebts.push({
        id: hashedCode,
        name: stringify(req.body.name, false),
      });
      document.userDebts[document.userDebts.length - 1].debts.push({
        id: generarCodigo(8),
        destinationAccountId: req.body.destinationAccountId,
        date: req.body.date,
        price: req.body.price,
        description: req.body.description.trim(),
        tzOffset: req.body.tzOffset,
        title: req.body.title.trim(),
      });
    }
  } else {
    if (document.otherDebts.some((obj) => obj.id === hashedCode)) {
      // ya existe el deudor
      let index = document.userDebts
        .map((x) => {
          return x.id;
        })
        .indexOf(hashedCode);

      document.otherDebts[index].debts.push({
        id: generarCodigo(8),
        originAccountId: req.body.originAccountId,
        date: req.body.date,
        price: req.body.price,
        description: req.body.description.trim(),
        tzOffset: req.body.tzOffset,
        title: req.body.title.trim(),
      });
    } else {
      // primer prestamo a este deudor
      document.otherDebts.push({
        id: hashedCode,
        name: stringify(req.body.name, false),
      });
      document.otherDebts[document.otherDebts.length - 1].debts.push({
        id: generarCodigo(8),
        originAccountId: req.body.originAccountId,
        date: req.body.date,
        price: req.body.price,
        description: req.body.description.trim(),
        tzOffset: req.body.tzOffset,
        title: req.body.title.trim(),
      });
    }
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

router.delete(
  "/api/debt/:type/:personId/:debtId",
  isAuthenticated,
  (req, res) => {
    const dni = process.env.NODE_ENV === "test" ? "12345678" : req.user.dni;
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

          document.userDebts[personIndex].debts.splice(debtIndex, 1);

          if (document.userDebts[personIndex].debts.length === 0) {
            document.userDebts.splice(personIndex, 1);
          }
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

          document.otherDebts[personIndex].debts.splice(debtIndex, 1);

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

module.exports = router;
