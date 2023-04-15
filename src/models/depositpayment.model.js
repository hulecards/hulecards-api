module.exports = (sequelize, Sequelize) => {
    return sequelize.define("depositpayments", {
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
        cardId: {
            type: Sequelize.INTEGER,
            references: {
                model: 'cards',
                key: 'id'
            }
        },
        isCardRegistration: Sequelize.BOOLEAN,
        bank: Sequelize.STRING,
        transactionId: Sequelize.STRING,
        bankShortCode: Sequelize.STRING,
        initialDepositInUsd: Sequelize.DECIMAL(10, 2),
        dollarExchangeRate: Sequelize.DECIMAL(6, 2),
        amountETB: Sequelize.DECIMAL(10, 2),
        promoCode: Sequelize.STRING,
        promoCodeApplied: {
            type: Sequelize.BOOLEAN, 
            allowNull: false, 
            defaultValue: false
         },
        receipt: Sequelize.STRING,
        status: {
			type: Sequelize.ENUM,
			values: ["paid", "verified", "declined"],
			defaultValue: "paid"
		},
        verificationStatus: {
			type: Sequelize.ENUM,
			values: ["pending", "verified", "amount_less_than_required", "date_before_transaction"],
			defaultValue: "pending"
		}
    });
};