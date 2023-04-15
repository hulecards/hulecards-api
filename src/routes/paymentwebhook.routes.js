const { authJwt } = require("../middlewares");
const controller = require("../controllers/paymentwebhook.controller");

module.exports = function (app) {
    app.post(
		"/paymenthook",
		controller.paymenthook
	);
	app.post(
		"/paymentverificationhook",
		controller.paymentverificationhook
	);
    app.get(
		"/paymenthook",
		controller.webhookget
	);
};