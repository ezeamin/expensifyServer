const express = require("express");
const router = express.Router();

const jwt = require("jsonwebtoken");

const validar = require("../../helpers/validar");
const isAuthenticated = require("../../helpers/isAuthenticated");
const initiateDbUsers = require("../../helpers/db/initiate");

const DbUsers = require("../../models/user");
const DbTokens = require("../../models/token");
const { generateAccessToken } = require("../../helpers/tokens");
const generarCodigo = require("../../helpers/generarCodigo");

router.post("/api/signup", async (req, res) => {
  if (!validar(req.body)) {
    res.status(401).json({
      ok: false,
      message: "Datos inválidos",
    });
    return;
  }

  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  console.log(token);
  if (token !== "null") {
    return res.status(401).json({
      message: "Usuario ya autenticado",
    });
  }

  const exists = await DbUsers.exists({ email: req.body.email });
  const existsDni = await DbUsers.exists({ dni: req.body.dni });

  if (exists) {
    return res.status(401).json({
      message: "Email en uso",
    });
  } else if (existsDni) {
    return res.status(401).json({
      message: "DNI en uso",
    });
  } else {
    try {
      const user = new DbUsers({
        email: req.body.email,
        password: req.body.password,
        name: req.body.name,
        dni: req.body.dni,
        recCode: generarCodigo(15),
        incorporation: new Date(),
      });

      user.password = user.encryptPassword(req.body.password);

      await user.save();

      await initiateDbUsers(req.body.dni);

      return res.sendStatus(200);
    } catch (error) {
      return res.status(500).json({
        message: "Error al registrar",
        extra: error,
      });
    }
  }
});

router.post("/api/signin", async (req, res) => {
  if (!validar(req.body)) {
    res.status(401).json({
      ok: false,
      message: "Datos inválidos",
    });
    return;
  }

  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  console.log(token);
  if (token !== "null") {
    return res.status(401).json({
      message: "Usuario ya autenticado",
    });
  }

  const user = await DbUsers.findOne({ dni: req.body.dni });

  if (!user) {
    return res.status(401).json({ message: "DNI no registrado" });
  }
  if (!user.comparePassword(req.body.password, user.password)) {
    return res.status(401).json({ message: "Contraseña incorrecta" });
  }

  const data = user.toJSON();
  delete data.password;
  delete data.recCode;

  const accessToken = generateAccessToken(data);
  const refreshToken = jwt.sign(data, process.env.REFRESH_SECRET_KEY);

  DbTokens.create({
    userId: user._id,
    token: refreshToken,
  });

  return res.status(200).json({
    accessToken,
    refreshToken,
  });
});

router.post("/api/refreshToken", async (req, res) => {
  const refreshToken = req.body.token;
  if (!refreshToken) {
    return res.sendStatus(401);
  }

  DbTokens.findOne({ token: refreshToken }, async (err, token) => {
    if (err) {
      return res.sendStatus(500);
    }

    if (!token) {
      return res.sendStatus(403);
    }

    jwt.verify(
      refreshToken,
      process.env.REFRESH_SECRET_KEY,
      async (err, user) => {
        if (err) {
          return res.sendStatus(403);
        }

        delete user.iat;
        delete user.sub;

        const authToken = generateAccessToken(user);

        return res.status(200).json({
          token: authToken,
        });
      }
    );
  });
});

router.delete("/api/logout", (req, res) => {
  let token = req.headers.refresh;

  if (token === null) {
    return res.sendStatus(304);
  }

  DbTokens.deleteOne({ token }, (err) => {
    if (err) {
      return res.sendStatus(500);
    }

    return res.sendStatus(204);
  });
});

router.get("/api/auth", isAuthenticated, (req, res) => {
  res.status(200).json({
    user: {
      name: req.user.name,
      dni: req.user.dni,
      email: req.user.email,
      incorporation: req.user.incorporation,
    },
  });
});

module.exports = router;
