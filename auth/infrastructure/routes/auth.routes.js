const controller = require("../controllers/auth.controller")();
const urlGenerator = require("../../utils/helpers")("auth");

const routes = [
  {
    path: urlGenerator("/login"),
    method: "post",
    handler: [controller.login],
  },
];

module.exports = routes;
