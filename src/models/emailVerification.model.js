module.exports = (sequelize, Sequelize) => {
	return sequelize.define("emailVerification", {
		email: {
			type: Sequelize.STRING,
			primaryKey: true
		},
		code: {
			type: Sequelize.STRING
		}
	});
};