const { authJwt } = require("../middlewares");
const controller = require("../controllers/user.controller");

module.exports = function (app) {
	app.post(
		"/user/kyc",
		[authJwt.verifyToken],
		controller.kyc
	);
	app.get("/test/all", controller.allAccess);
	app.get(
		"/test/user",
		[authJwt.verifyToken],
		controller.userBoard
	);
	app.get(
		"/test/mod",
		[authJwt.verifyToken, authJwt.isModerator],
		controller.moderatorBoard
	);
	app.get(
		"/test/admin",
		[authJwt.verifyToken, authJwt.isAdmin],
		controller.adminBoard
	);
};