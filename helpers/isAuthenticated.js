function isAuthenticated(req, res, next) {
  if (process.env.NODE_ENV === "test" || req.isAuthenticated()) { //funcion de passport
    return next();
  }
  return res.sendStatus(401);
}

module.exports = isAuthenticated;
