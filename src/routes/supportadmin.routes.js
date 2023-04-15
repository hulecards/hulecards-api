const { authJwt } = require("../middlewares");
const controller = require("../controllers/supportadmin.controller");

module.exports = function (app) {
    app.post("/support/getinfo",
        [authJwt.verifyToken, authJwt.isAdmin],
        controller.getinfo);
};