module.exports = (sequelize, Sequelize) => {
	return sequelize.define("webhookcalls", {
		id: {
			type: Sequelize.INTEGER,
			primaryKey: true
		},
		content: {
			type: Sequelize.STRING
		}
	});
};