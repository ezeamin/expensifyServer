const express = require("express");
const router = express.Router();

const validar = require("../../helpers/validar");
const validarKeys = require("../../helpers/validarKeys");
const isAuthenticated = require("../../helpers/isAuthenticated");
const generarCodigo = require("../../helpers/generarCodigo");
const stringify = require("../../helpers/stringify");

const DbDebts = require("../../models/debt");
const hashing = require("../../helpers/debtorHashing");

router.get("/api/debts", isAuthenticated, async (req, res) => {
  const dni = process.env.NODE_ENV === "test" ? "12345678" : req.user.dni;

  const document = await DbDebts.findOne({ dni });
  res.json(document);
});

router.put("/api/debt/:type", isAuthenticated, async (req, res) => {
  const type = req.params.type;

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

  const hashedCode = hashing(
    type === "user" ? req.body.lenderName : req.body.debtorName
  );

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
        date: new Date(),
        price: req.body.price,
        description: req.body.description,
      });
    } else {
      // primer prestamo de este prestador
      document.userDebts.push({
        id: hashedCode,
        lenderName: stringify(req.body.lenderName, false),
      });
      document.userDebts[document.userDebts.length - 1].debts.push({
        id: generarCodigo(8),
        destinationAccountId: req.body.destinationAccountId,
        date: new Date(),
        price: req.body.price,
        description: req.body.description,
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
        date: new Date(),
        price: req.body.price,
        description: req.body.description,
      });
    } else {
      // primer prestamo a este deudor
      document.otherDebts.push({
        id: hashedCode,
        debtorName: stringify(req.body.debtorName, false),
      });
      document.otherDebts[document.otherDebts.length - 1].debts.push({
        id: generarCodigo(8),
        originAccountId: req.body.originAccountId,
        date: new Date(),
        price: req.body.price,
        description: req.body.description,
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
