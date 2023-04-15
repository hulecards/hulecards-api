const { authJwt } = require("../middlewares");
const controller = require("../controllers/webhook.controller");

module.exports = function (app) {
    app.post(
		"/webhook",
		controller.webhook
	);
    app.get(
		"/webhook",
		controller.webhookget
	);
};