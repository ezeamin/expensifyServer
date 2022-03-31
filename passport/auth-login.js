const passport = require("passport");
const localStrategy = require("passport-local").Strategy;

const User = require("../models/user");
const generarCodigo = require("../helpers/generarCodigo");

passport.use(
  "local-login",
  new localStrategy(
    {
      usernameField: "dni",
      passwordField: "password",
      passReqToCallback: false,
    },
    async (dni, password, done) => {
      const user = await User.findOne({ dni: dni });

      if (!user) {
        return done({ message: "DNI no registrado"}, false);
      }
      if (!user.comparePassword(password, user.password)) {
        return done({ message: "Contraseña incorrecta"}, false);
      }
      return done(null, user);
    }
  )
);

passport.use(
  "local-signup",
  new localStrategy(
    {
      usernameField: "dni",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, dni, password, done) => {
      const exists = await User.exists({ email: req.body.email });
      const existsDni = await User.exists({ dni: dni });

      if (exists) {
        return done(null, false, {
          message: "Email en uso.",
          code: 401,
        });
      } else if (existsDni) {
        return done(null, false, {
          message: "DNI en uso.",
          code: 401,
        });
      } else {
        try {
          const user = new User({
            email: req.body.email,
            password: req.body.password,
            name: req.body.name,
            dni: req.body.dni,
            recCode: generarCodigo(15),
            incorporation: new Date(),
          });

          user.password = user.encryptPassword(password);

          await user.save();
          return done(null, { message: "Registro exitoso."});
        } catch (error) {
          return done(null, false, {
            message: "Error al registrar.",
            extra: error,
          });
        }
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});
