require("dotenv").config();

const express = require("express");
const morgan = require("morgan");
const passport = require("passport");
const session = require("express-session");
const cors = require("cors");

const app = express();
const routesAuth = require("./routes/auth/auth");
const routesCategories = require("./routes/categories/categories");
const routesAccounts = require("./routes/accounts/accounts");
require("./database/database");
require("./passport/auth-login");

//settings
app.set("port", process.env.PORT || 5000);

//middlewares
//app.use(express.static(__dirname + '/public'));
app.use(cors());
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

//routes
app.use(routesAuth);
app.use(routesCategories);
app.use(routesAccounts);

/*app.route("*").get((req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});*/

if (process.env.NODE_ENV !== "test") {
  app.listen(app.get("port"), () => {
    console.log(`Server on port ${app.get("port")}`);
  });
}

module.exports = app;
