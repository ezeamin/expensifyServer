const express = require("express");
const router = express.Router();

const isAuthenticated = require("../../helpers/isAuthenticated");

const DbPeriod = require("../../models/period");
const DbUsers = require("../../models/user");
const transferOldData = require("../../helpers/db/transferOldData");

router.get("/api/isNewMonth", isAuthenticated, (req, res) => {
  const dni = process.env.NODE_ENV === "test" ? "12345678" : req.user.dni;

  const date = new Date();
  const localTz = date.getTimezoneOffset();

  if (localTz !== 180) {
    date.setMinutes(date.getMinutes() + 180 * -1);
  }

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

router.get("/api/periods/:year", isAuthenticated, async (req, res) => {
  const dni = process.env.NODE_ENV === "test" ? "12345678" : req.user.dni;
  const year = req.params.year;

  const periodos = await DbPeriod.findOne({ dni });
  if (periodos.length === 0) {
    return res.sendStatus(404);
  }

  const periodosYear = periodos.periods.find((periodo) => {
    return periodo.year === parseInt(year);
  });

  res.json(periodosYear);
});

router.get(
  "/api/periods/:year/monthNum/:id",
  isAuthenticated,
  async (req, res) => {
    const dni = process.env.NODE_ENV === "test" ? "12345678" : req.user.dni;
    const year = req.params.year;
    const id = req.params.id;

    const periodos = await DbPeriod.findOne({ dni });
    if (periodos.length === 0) {
      return res.sendStatus(404);
    }

    const periodYearDoc = periodos.periods.find(
      (period) => period.year === Number(year)
    );
    const periodDoc = periodYearDoc.periods.find((period) => period.id === id);
    const date = periodDoc.start;

    const localTz = date.getTimezoneOffset();
    if (180 !== localTz) {
      date.setMinutes(date.getMinutes() + 180 * -1);
    }

    const month = date.getMonth();

    res.json({ month });
  }
);

module.exports = router;
