require("dotenv").config();

const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const useragent = require('express-useragent');

const app = express();
require("./database/database");

const routesAuth = require("./routes/0-auth/auth");
const routesCategories = require("./routes/categories/categories");
const routesAccounts = require("./routes/accounts/accounts");
const routesExpenses = require("./routes/expenses/expenses");
const routesIncomes = require("./routes/incomes/incomes");
const routesTransfers = require("./routes/transfers/transfers");
const routesDebts = require("./routes/debts/debts");
const routesPayments = require("./routes/payments/payments");
const routesPeriods = require("./routes/periods/periods");
const routesCharts = require("./routes/charts/charts");

//settings
app.set("port", process.env.PORT || 5000);

//middlewares
//app.use(express.static(__dirname + '/public'));
app.use(cors({
  origin: ["https://expensify-arg.netlify.app","http://localhost:3000","*"],
}));
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(useragent.express());

//routes
app.use(routesAuth);
app.use(routesCategories);
app.use(routesAccounts);
app.use(routesExpenses);
app.use(routesIncomes);
app.use(routesTransfers);
app.use(routesDebts);
app.use(routesPayments);
app.use(routesPeriods);
app.use(routesCharts);

/*app.route("*").get((req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});*/

if (process.env.NODE_ENV !== "test") {
  app.listen(app.get("port"), () => {
    console.log(`Server on port ${app.get("port")}`);
  });
}

module.exports = app;
