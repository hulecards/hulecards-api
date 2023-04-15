module.exports = (sequelize, Sequelize) => {
    return sequelize.define("depositrequests", {
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
        amount: Sequelize.DECIMAL(10, 2),
        dollarExchangeRate: Sequelize.DECIMAL(6, 2),
        amountETB: Sequelize.DECIMAL(10, 2)
    });
};