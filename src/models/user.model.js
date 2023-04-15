module.exports = (sequelize, Sequelize) => {
	return sequelize.define("users", {
		fullName: {
			type: Sequelize.STRING
		},
		email: {
			type: Sequelize.STRING
		},
		password: {
			type: Sequelize.STRING
		},
		solypay_id: {
			type: Sequelize.STRING,
			unique: false
		},
		streetAddress: {
			type: Sequelize.STRING
		},
		phoneNumber: {
			type: Sequelize.STRING
		},
		identification: {
			type: Sequelize.STRING
		},
		emailVerified: {
			type: Sequelize.BOOLEAN, 
            allowNull: false, 
            defaultValue: false
		}
	});
};