const express = require("express");
const passport = require("passport");
const router = express.Router();

const validar = require("../../helpers/validar");
const isAuthenticated = require("../../helpers/isAuthenticated");
const initiateUser = require("../../helpers/db/initiate");

const DbUsers = require("../../models/user");

router.post("/api/signup", (req, res) => {
  if (!validar(req.body)) {
    res.status(401).json({
      ok: false,
      message: "Datos inválidos",
    });
    return;
  }

  if(req.isAuthenticated()) {
    res.status(401).json({message: "Usuario ya autenticado"});
    return;
  }

  passport.authenticate("local-signup", async (err, user, info) => {
    if (err) {
      return res.status(500).json(err);
    }
    if (!user) {
      return res.status(401).json(info);
    }

    await initiateUser(req.body.dni);

    return res.sendStatus(200);
  })(req, res);
});

router.post("/api/signin", (req, res) => {
  if (!validar(req.body)) {
    res.status(401).json({
      ok: false,
      message: "Datos inválidos",
    });
    return;
  }

  if(req.isAuthenticated()) {
    res.status(401).json({message: "Usuario ya autenticado"});
    return;
  }

  passport.authenticate("local-login", (err, user) => {
    if (err) {
      return res.status(401).json(err);
    }
    req.logIn(user, async () => {
      res.sendStatus(200);

      const user = await DbUsers.findOne({dni: req.body.dni});
      user.recCode = req.session.passport.user; //cambio el codigo de recuperacion
      await user.save();
    });
  })(req, res);
});

router.delete("/api/logout", (req, res) => {
  req.logout();
  res.sendStatus(200);
});

router.get("/api/auth", isAuthenticated, (req, res) => {
  res.status(200).json({
    user: {
      name: req.user.name,
      dni: req.user.dni,
      email: req.user.email,
      incorporation: req.user.incorporation,
      //recCode: req.user.recCode,
    },
  });
});

module.exports = router;
