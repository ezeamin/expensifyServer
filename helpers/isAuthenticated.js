function isAuthenticated(req, res, next) {
  console.log(req.session);
  if (process.env.NODE_ENV === "test" || req.isAuthenticated()) { //funcion de passport
    return next();
  }
  return res.sendStatus(401);
}

module.exports = isAuthenticated;
