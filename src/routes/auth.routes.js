const { verifySignUp } = require("../middlewares");
const { authJwt } = require("../middlewares");
const controller = require("../controllers/auth.controller");

module.exports = function (app) {
	app.post(
		"/auth/signup",
		[
			verifySignUp.checkDuplicateEmail,
			verifySignUp.checkRolesExisted
		],
		controller.signup
	);
	app.post("/auth/refreshToken", [authJwt.verifyToken], controller.refreshToken);
	app.post("/auth/signin", controller.signin);
	app.post("/auth/forgotPassword", controller.forgotPassword);
	app.post("/auth/verifyVerificationCode", controller.verifyVerificationCode);
};