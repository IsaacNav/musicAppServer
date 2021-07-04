const passport = require("passport");
const { BAD_REQUEST } = require("http-status-codes");

module.exports = function authController() {
  const login = (req, res, next) =>
    passport.authenticate(
      "user-local",
      { session: false },
      (err, passportUser, info) => {
        if (err) {
          return next(err);
        }

        if (passportUser) {
          const newUser = passportUser;
          newUser.token = passportUser.generateJWT();
          return res.json({ user: newUser.toAuthJSON() });
        }

        return res.status(BAD_REQUEST).json(info);
      }
    )(req, res, next);

  const forgotPassword = (req, res, next) => {
    // TODO
  };

  const resetPassword = (req, res, next) => {
    // TODO
  };

  return {
    login,
    forgotPassword,
    resetPassword,
  };
};
