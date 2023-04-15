const { authJwt } = require("../middlewares");
const controller = require("../controllers/adminvirtualcards.controller");

module.exports = function (app) {
    app.get("/admin/orders",
        [authJwt.verifyToken, authJwt.isAdmin],
        controller.getorders);
    app.post("/admin/approveorder",
        [authJwt.verifyToken, authJwt.isAdmin],
        controller.approveorder);
    app.post("/admin/declineorder",
        [authJwt.verifyToken, authJwt.isAdmin],
        controller.declineorder);

    app.get("/admin/deposits",
        [authJwt.verifyToken, authJwt.isAdmin],
        controller.getdeposits);
    app.post("/admin/approvedeposit",
        [authJwt.verifyToken, authJwt.isAdmin],
        controller.approvedeposit);
    app.post("/admin/declinedeposit",
        [authJwt.verifyToken, authJwt.isAdmin],
        controller.declinedeposit);
};