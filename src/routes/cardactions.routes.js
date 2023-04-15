const { authJwt } = require("../middlewares");
const controller = require("../controllers/cardaction.controller");

module.exports = function (app) {
	app.post(
		"/actions/withdrawrequest",
		[authJwt.verifyToken],
		controller.withdrawal
	);
    app.post(
		"/actions/depositrequest",
		[authJwt.verifyToken],
		controller.deposit
	);
};