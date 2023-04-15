const { authJwt } = require("../../middlewares");
const controller = require("../../controllers/admin/users.controller");

module.exports = function (app) {
    app.get("/admin/users/list",
        [authJwt.verifyToken, authJwt.isAdmin],
        controller.list);
};