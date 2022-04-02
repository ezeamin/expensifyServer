const express = require("express");
const router = express.Router();

const validar = require("../../helpers/validar");
const validarKeys = require("../../helpers/validarKeys");
const isAuthenticated = require("../../helpers/isAuthenticated");
const generarCodigo = require("../../helpers/generarCodigo");
const stringify = require("../../helpers/stringify");

const DbCategories = require("../../models/category");
const editList = require("../../helpers/db/editList");

router.get("/api/categories", isAuthenticated, async (req, res) => {
  const dni = process.env.NODE_ENV === "test" ? "12345678" : req.user.dni;

  const categories = await DbCategories.findOne({ dni });
  res.status(200).json(categories);
});

router.put("/api/category", isAuthenticated, (req, res) => {
  if (!validar(req.body) || !validarKeys("newCategory",req.body)) {
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
          title: stringify(req.body.title,true),
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

  const dni = process.env.NODE_ENV === "test" ? "12345678" : req.user.dni;

  editList("category", dni, req.params.id, req.body,res);
});

//reset spent of all categories
router.put("/api/categories/reset", isAuthenticated, (req, res) => {
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

      category.categories.forEach((category) => {
        category.spent = 0;
      });

      category.save((err) => {
        if (err) {
          return res.status(401).json({
            err,
          });
        }

        res.sendStatus(200);
      });
    }
  );
});

router.delete("/api/category/:id", isAuthenticated, (req, res) => {
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

      category.categories.splice(categoryPosition, 1);

      category.save((err) => {
        if (err) {
          return res.status(401).json({
            err,
          });
        }

        res.sendStatus(200);
      });
    }
  );
});

module.exports = router;
