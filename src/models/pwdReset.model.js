module.exports = (sequelize, Sequelize) => {
	return sequelize.define("pwdResets", {
		userId: {
			type: Sequelize.INTEGER,
			primaryKey: true
		},
		code: {
			type: Sequelize.STRING
		}
	});
};