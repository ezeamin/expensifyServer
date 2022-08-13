const express = require("express");
const router = express.Router();

const isAuthenticated = require("../../helpers/isAuthenticated");

const DbPeriod = require("../../models/period");
const DbUsers = require("../../models/user");
const transferOldData = require("../../helpers/db/transferOldData");

router.get("/api/isNewMonth", isAuthenticated, (req, res) => {
  const dni = process.env.NODE_ENV === "test" ? "12345678" : req.user.dni;

  const date = new Date();
  DbUsers.findOne({ dni }, (err, user) => {
    if (err) {
      console.log(err);
    } else {
      if (user.currentPeriod !== date.getMonth()) {
        res.json({ isNewMonth: true });
        transferOldData();
      } else {
        res.json({ isNewMonth: false });
      }
    }
  });
});

router.get("/api/periods", isAuthenticated, async (req, res) => {
  const dni = process.env.NODE_ENV === "test" ? "12345678" : req.user.dni;

  const periodos = await DbPeriod.findOne({ dni });
  if (periodos.length === 0) {
    return res.sendStatus(404);
  }

  res.json(periodos);
});

module.exports = router;
