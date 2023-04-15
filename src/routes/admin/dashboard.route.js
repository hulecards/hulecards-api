const { authJwt } = require("../../middlewares");
const controller = require("../../controllers/admin/dashboard.controller");

module.exports = function (app) {
    app.get("/admin/dashboard/info",
        [authJwt.verifyToken, authJwt.isAdmin],
        controller.info);
};