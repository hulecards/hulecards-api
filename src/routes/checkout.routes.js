const { authJwt } = require("../middlewares");
const controller = require("../controllers/checkout.controller");

module.exports = function (app) {
    app.post("/checkout",
        [authJwt.verifyToken],
        controller.checkout);
};