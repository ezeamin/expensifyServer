const express = require("express");
const router = express.Router();

const validar = require("../../helpers/validar");
const validarKeys = require("../../helpers/validarKeys");
const isAuthenticated = require("../../helpers/isAuthenticated");
const generarCodigo = require("../../helpers/generarCodigo");
const stringify = require("../../helpers/stringify");
const generateColor = require("../../helpers/generateColor");

const DbCategories = require("../../models/category");
const editList = require("../../helpers/db/editList");
const dataSorterByTitle = require("../../helpers/dataSorterByTitle");

router.get("/api/categories", isAuthenticated, async (req, res) => {
  const dni = process.env.NODE_ENV === "test" ? "12345678" : req.user.dni;

  const categories = await DbCategories.findOne({ dni });
  const sortedCategories = categories.categories.sort(dataSorterByTitle);

  res.status(200).json({ categories: sortedCategories });
});

router.get("/api/category/:id", isAuthenticated, async (req, res) => {
  const id = req.params.id;
  const dni = process.env.NODE_ENV === "test" ? "12345678" : req.user.dni;

  const categories = await DbCategories.findOne({ dni });
  const category = categories.categories.find((category) => category.id === id);

  res.status(200).json(category);
});

router.put("/api/category", isAuthenticated, async (req, res) => {
  req.body.color = generateColor();

  if (!validar(req.body) || !validarKeys("newCategory", req.body)) {
    res.status(401).json({
      message: "Datos inválidos",
    });
    return;
  }

  const categoryDoc = await DbCategories.findOne({ dni: req.user.dni });
  const existingCategory = categoryDoc.categories.filter(
    (acc) =>
      acc.title.trim().toLowerCase() === req.body.title.trim().toLowerCase()
  )[0];

  if (existingCategory) {
    res.status(401).json({
      message: "Ya existe una categoría con este nombre",
    });
    return;
  }

  DbCategories.findOneAndUpdate(
    { dni: process.env.NODE_ENV === "test" ? req.body.dni : req.user.dni },
    {
      $push: {
        categories: {
          id: generarCodigo(8),
          title: stringify(req.body.title, true),
          icon: req.body.icon,
          limit: req.body.limit,
          color: req.body.color,
          spent: 0,
          description: req.body.description,
          noLimit: Number.parseFloat(req.body.limit) === 0,
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

  editList("category", dni, req.params.id, req.body, res);
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
