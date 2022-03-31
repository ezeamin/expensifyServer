const express = require("express");
const passport = require("passport");
const router = express.Router();

const validar = require("../../helpers/validar");
const isAuthenticated = require("../../helpers/isAuthenticated");

router.post("/api/signup", (req, res) => {
  if (!validar(req.body)) {
    res.status(401).json({
      ok: false,
      message: "Datos inválidos",
    });
    return;
  }

  passport.authenticate("local-signup", (err, user, info) => {
    if (err) {
      return res.status(500).json(err);
    }
    if (!user) {
      return res.status(401).json(info);
    }
    return res.status(200).json(user);
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

  passport.authenticate("local-login", (err,user)=>{
    if(err){
      return res.status(401).json(err);
    }
    req.logIn(user,()=>{
      return res.sendStatus(200);
    });
  })(req, res);
});

router.get("/api/error", (req, res) => {
  res.sendStatus(401);
});

router.get("/api/success", (req, res) => {
  res.status(200).json({ message: "Success" });
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
