const express = require("express");
const router = express.Router();

const validar = require("../../helpers/validar");
const isAuthenticated = require("../../helpers/isAuthenticated");
const generarCodigo = require("../../helpers/generarCodigo");
const stringify = require("../../helpers/stringify");

const DbCategories = require("../../models/category");

router.get("/api/categories/:dni", isAuthenticated, async (req, res) => {
  const dni = req.params.dni;

  const categories = await DbCategories.findOne({ dni });
  res.status(200).json(categories);
});

router.post("/api/category", isAuthenticated, (req, res) => {
  if (!validar(req.body)) {
    res.status(401).json({
      message: "Datos inválidos",
    });
    return;
  }

  const category = new DbCategories({
    dni: process.env.NODE_ENV === "test" ? req.body.dni : req.user.dni,
    categories: [
      {
        id: generarCodigo(8),
        title: stringify(req.body.title),
        icon: req.body.icon,
        limit: req.body.limit,
        spent: 0,
        description: req.body.description,
      },
    ],
  });

  category.save((err) => {
    if (err) {
      return res.status(401).json({
        err,
      });
    }

    res.sendStatus(200);
  });
});

router.put("/api/category", isAuthenticated, (req, res) => {
  if (!validar(req.body)) {
    res.status(401).json({
      message: "Datos inválidos",
    });
    return;
  }

  DbCategories.findOneAndUpdate(
    { dni: process.env.NODE_ENV === "test" ? req.body.dni : req.user.dni },
    {
      $push: {
        categories: {
          id: generarCodigo(8),
          title: stringify(req.body.title),
          icon: req.body.icon,
          limit: req.body.limit,
          spent: 0,
          description: req.body.description,
        },
      },
    },
    { new: true },
    (err, category) => {
      if (err) {
        return res.status(401).json({
          err,
        });
      }

      res.status(200).json(category);
    }
  );
});

router.put("/api/category/:id", isAuthenticated, (req, res) => {
  if (!validar(req.body)) {
    res.status(401).json({
      message: "Datos inválidos",
    });
    return;
  }

  DbCategories.findOne(
    {
      dni: process.env.NODE_ENV === "test" ? req.body.dni : req.user.dni,
    },
    (err, category) => {
      if (err) {
        return res.status(401).json({
          err,
        });
      }

      let categoryPosition = category.categories.findIndex(
        (category) => category.id === req.params.id
      );

      category.categories[categoryPosition].set(req.body);

      category.save((err) => {
        if (err) {
          return res.status(401).json({
            err,
          });
        }
      });

      res.sendStatus(200);
    }
  );
});

module.exports = router;
