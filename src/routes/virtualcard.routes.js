const { authJwt } = require("../middlewares");
const controller = require("../controllers/virtualcard.controller");

module.exports = function (app) {
    app.get("/virtualcards/my",
        [authJwt.verifyToken],
        controller.my);
    app.get(
        "/virtualcards/:id",
        [authJwt.verifyToken],
        controller.getOne
    );
    app.get(
        "/virtualcards/transactions/:id",
        [authJwt.verifyToken],
        controller.transactions
    );
    app.post(
        "/virtualcards/order",
        [authJwt.verifyToken],
        controller.order
    );
    app.post(
		"/virtualcards/import",
		[authJwt.verifyToken],
		controller.import
	);
};