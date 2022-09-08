const express = require("express");
const router = express.Router();

const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const validar = require("../../helpers/validar");
const isAuthenticated = require("../../helpers/isAuthenticated");
const initiateDbUsers = require("../../helpers/db/initiate");

const DbUsers = require("../../models/user");
const DbDebts = require("../../models/debt");
const DbTokens = require("../../models/token");
const DbAccounts = require("../../models/account");
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

  if (token && token.length >= 10) {
    return res.status(401).json({
      message: "Usuario ya autenticado",
    });
  }

  const exists = await DbUsers.exists({ email: req.body.email.trim() });
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
        email: req.body.email.trim(),
        password: req.body.password.trim(),
        name: req.body.name.trim(),
        dni: req.body.dni,
        recCode: generarCodigo(15),
        incorporation: new Date(),
        currentPeriod: new Date().getMonth(),
        shouldSeeStatus: true,
        hasAskedForNewPassword: false,
      });

      user.password = user.encryptPassword(req.body.password);

      await user.save();

      await initiateDbUsers(req.body.dni, req.body.limit);

      const transporter = nodemailer.createTransport({
        host: "smtp-mail.outlook.com",
        auth: {
          user: "expensify-arg@outlook.com",
          pass: process.env.EMAIL_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false,
          ciphers: "SSLv3",
        },
      });

      const mailOptions = {
        from: "expensify-arg@outlook.com",
        to: req.body.email.trim,
        subject: "Bienvenido a Expensify",
        text: `Hola, ${user.name}!\n\nBienvenido a Expensify.\n\nAhora te podremos robar toda tu información muy tranquilos... :D\n\nSaludos,\nEquipo Expensify\n`,
      };

      transporter.sendMail(mailOptions);

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

  // const authHeader = req.headers.authorization;
  // const token = authHeader && authHeader.split(" ")[1];

  // if (token && token.length >= 10) { //TODO: revisar
  //   //null & undefined
  //   return res.status(401).json({
  //     message: "Usuario ya autenticado", //multiples dispositivos?
  //   });
  // }

  const user = await DbUsers.findOne({ dni: req.body.dni });

  if (!user) {
    return res.status(401).json({ message: "DNI no registrado" });
  }
  if (!user.comparePassword(req.body.password.trim(), user.password)) {
    return res.status(401).json({ message: "Contraseña incorrecta" });
  }

  user.hasAskedForNewPassword = false;
  await user.save();

  const data = user.toJSON();
  delete data.password;
  delete data.recCode;

  const accessToken = generateAccessToken(data);
  const refreshToken = jwt.sign(data, process.env.REFRESH_SECRET_KEY);

  const doc = await DbTokens.findOne({
    userId: user._id,
    browser: req.useragent.browser,
    os: req.useragent.os,
    isMobile: req.useragent.isMobile,
  });

  if (doc) {
    doc.token = refreshToken;
    await doc.save();
    return res
      .status(401)
      .json({ message: "Usuario ya autenticado", accessToken, refreshToken });
  }

  try {
    DbTokens.create({
      userId: user._id,
      token: refreshToken,
      browser: req.useragent.browser,
      os: req.useragent.os,
      isMobile: req.useragent.isMobile,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error de servidor, intenta mas tarde" });
  }

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

router.put("/api/email/:dni", async (req, res) => {
  const dni = req.params.dni;

  const user = await DbUsers.findOne({ dni });

  if (!user) {
    return res.status(401).json({
      message: "DNI no registrado",
    });
  }

  // disguise mail as aa**bb@mail.com
  const mail = user.email.split("@");
  const encryptedMail = `${mail[0][0]}${mail[0][1]}**${
    mail[0][mail[0].length - 2]
  }${mail[0][mail[0].length - 1]}@${mail[1]}`;

  if (user.hasAskedForNewPassword) {
    const message = `Ya fue enviado un mail de recuperacion para esta cuenta. Revisa la casilla de ${encryptedMail}`;
    return res.status(401).json({
      message,
    });
  }

  const transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com",
    auth: {
      user: "expensify-arg@outlook.com",
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
      ciphers: "SSLv3",
    },
  });

  const mailOptions = {
    from: "expensify-arg@outlook.com",
    to: user.email,
    subject: "Expensify - Recuperacion de contraseña",
    text: `Hola, ${user.name}!\n\nPara recuperar tu contraseña, ingresa a este link: https://expensify-arg.netlify.app/auth/recPassword/${user.recCode}\n\nSaludos,\nEquipo Expensify\n\nSi no pediste este cambio, podés ignorar este correo.`,
  };

  transporter.sendMail(mailOptions, async (error) => {
    if (error) {
      return res.status(500).json({
        message: "Error al enviar correo",
        extra: error,
      });
    } else {
      user.hasAskedForNewPassword = true;

      await user.save();
      return res.status(200).json({ email: encryptedMail });
    }
  });
});

// check for existing recCode
router.get("/api/auth/recPassword/:recCode", async (req, res) => {
  const recCode = req.params.recCode;

  const user = await DbUsers.findOne({ recCode });

  if (!user || !user?.hasAskedForNewPassword) {
    return res.sendStatus(401);
  }

  return res.sendStatus(200);
});

router.put("/api/auth/recPassword", async (req, res) => {
  if (!req.body?.password || !req.body?.recCode) {
    return res.status(401).json({
      ok: false,
      message: "Datos inválidos",
    });
  }

  const user = await DbUsers.findOne({ recCode: req.body.recCode });

  if (!user) {
    return res.status(401).json({
      message: "Código de recuperacion inválido",
    });
  }

  if (!user.hasAskedForNewPassword) {
    return res.status(401).json({
      message: "No se pidió cambio de contraseña",
    });
  }

  user.password = user.encryptPassword(req.body.password);
  user.recCode = generarCodigo(15);
  user.hasAskedForNewPassword = false;

  await user.save();

  return res.sendStatus(200);
});

router.put(
  "/api/auth/recPasswordFromLoggedAccount",
  isAuthenticated,
  async (req, res) => {
    const dni = process.env.NODE_ENV === "test" ? "12345678" : req.user.dni;

    if (!req.body?.password) {
      return res.status(401).json({
        ok: false,
        message: "Datos inválidos",
      });
    }

    const user = await DbUsers.findOne({ dni });

    if (!user) {
      return res.status(401);
    }

    user.password = user.encryptPassword(req.body.password);
    user.recCode = generarCodigo(15);
    user.hasAskedForNewPassword = false;

    await user.save();

    return res.sendStatus(200);
  }
);

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

router.get("/api/ping", (req, res) => {
  return res.sendStatus(200);
});

router.put("/auth/changeAskForNewPassword", async (req, res) => {
  const user = await DbUsers.findOne({ dni: req.body.dni });

  if (!user) {
    return res.status(401).json({
      message: "DNI no registrado",
    });
  }

  user.hasAskedForNewPassword = false;

  await user.save();

  return res.sendStatus(200);
});

router.get("/api/auth", isAuthenticated, (req, res) => {
  res.status(200).json({
    user: {
      name: req.user.name,
      dni: req.user.dni,
      email: req.user.email,
      incorporation: req.user.incorporation,
      recCode: req.user.recCode,
    },
  });
});

router.get("/api/user", isAuthenticated, async (req, res) => {
  let saldo = 0;
  let spent = 0;

  const user = await DbUsers.findOne({ dni: req.user.dni });
  const debts = await DbDebts.findOne({ dni: req.user.dni });

  DbAccounts.findOne(
    {
      dni: req.user.dni,
    },
    (err, info) => {
      if (err) {
        return res.status(500).json({
          message: "Error al obtener saldo",
          extra: err,
        });
      }

      if (info.length === 0) {
        return res.status(500).json({
          message: "Error al obtener saldo",
        });
      }

      info.accounts.map((acc) => {
        saldo += acc.balance;
        spent += acc.spent;
      });

      const data = {
        name: req.user.name,
        dni: req.user.dni,
        email: req.user.email,
        incorporation: req.user.incorporation,
        generalLimit: info.generalLimit,
        totalOtherDebt: debts.totalOtherDebt,
        saldo,
        spent,
        shouldSeeStatus: user.shouldSeeStatus,
      };

      res.status(200).json(data);
    }
  );
});

router.put("/api/user", isAuthenticated, async (req, res) => {
  const dni = process.env.NODE_ENV === "test" ? "12345678" : req.user.dni;
  const newContent = req.body;

  const user = await DbUsers.findOne({ dni });

  if (!user) {
    return res.status(401).json({
      message: "DNI no registrado",
    });
  }

  Object.keys(newContent).forEach((key) => {
    user[key] = newContent[key];
  });

  await user.save();

  return res.status(200).json({
    message: "Usuario actualizado",
  });
});

router.put("/api/user/seeStatus", isAuthenticated, async (req, res) => {
  const dni = process.env.NODE_ENV === "test" ? "12345678" : req.user.dni;
  const { shouldSeeStatus } = req.body;

  const user = await DbUsers.findOne({ dni });

  if (!user) {
    return res.status(401).json({
      message: "DNI no registrado",
    });
  }

  user.shouldSeeStatus = shouldSeeStatus;

  await user.save();

  return res.status(200).json({
    message: "Usuario actualizado",
  });
});

module.exports = router;
