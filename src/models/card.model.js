module.exports = (sequelize, Sequelize) => {
	return sequelize.define("cards", {
		id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		userId: {
			type: Sequelize.INTEGER,
			references: {
				model: 'users',
				key: 'id'
			}
		},
		nickName: Sequelize.STRING,
		card_solypay_id: Sequelize.STRING,
		card_solypay_hash: Sequelize.STRING,
		nameOnCard: Sequelize.STRING,
		order_transaction_id: Sequelize.STRING,
		status: {
			type: Sequelize.ENUM,
			values: ["ordered", "paid", "declined", "issued"],
			defaultValue: "ordered"
		}
	});
};