module.exports = (sequelize, Sequelize) => {
	return sequelize.define("banktransactions", {
		id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		bank: {
			type: Sequelize.ENUM,
			values: ["abyssinia", "cbe"]
		},
		transactionId: {
			type: Sequelize.STRING,
			allowNull: false
		},
        date: {
			type: Sequelize.DATE,
			allowNull: false
        },
		amount: {
			type: Sequelize.DECIMAL(10, 2),
			allowNull: false
		},
		detail: Sequelize.STRING
	});
};