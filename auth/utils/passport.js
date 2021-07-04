const passport = require("passport");
const LocalStrategy = require("passport-local");
const UserRepository = require("../../users/domain/user.repository");

passport.use(
  "user-local",
  new LocalStrategy(
    {
      usernameField: "user[email]",
      passwordField: "user[password]",
    },
    function (email, password, done) {
      User.findOne({ username: username }, function (err, user) {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false);
        }
        if (!user.verifyPassword(password)) {
          return done(null, false);
        }
        return done(null, user);
      });
    }
  )
);
