const jwt = require("jsonwebtoken");
const DbTokens = require("../models/token");

const generateAccessToken = (user) => {
  return jwt.sign(user, process.env.ACCESS_SECRET_KEY, { expiresIn: "80h" }); //cambiar!!!!!!!!
};

const refreshToken = (req, res) => {
  const refreshToken = req.headers.refreshtoken;

  jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = jwt.sign(user, process.env.REFRESH_SECRET_KEY);

    DbTokens.findOneAndUpdate(
      { token: refreshToken },
      { token: refreshToken },
      (err) => {
        if (err) {
          return res.sendStatus(500);
        }
      }
    );

    res.json({ accessToken, refreshToken }); //me terminaria un proceso antes de asi quererlo
  });
};

module.exports = { generateAccessToken, refreshToken };
