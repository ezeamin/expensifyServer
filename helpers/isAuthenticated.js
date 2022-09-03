const jwt = require("jsonwebtoken");
// const { refreshToken } = require("./tokens");

function isAuthenticated(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.ACCESS_SECRET_KEY, (err, user) => {
    if (err) {
      //refreshToken(req,res); revisar como termina, sino corta el proceso
      return res.sendStatus(403);
    }

    req.user = user;
    next();
  });
}

module.exports = isAuthenticated;
