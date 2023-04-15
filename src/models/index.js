const config = require("../config/db.config.js");
const Sequelize = require("sequelize");
const sequelize = new Sequelize(config.DB, config.USER, config.PASSWORD, {
    logging: console.log,
    host: config.HOST,
    dialect: config.dialect,
    operatorsAliases: 0,
    pool: {
        max: config.pool.max,
        min: config.pool.min,
        acquire: config.pool.acquire,
        idle: config.pool.idle,
    },
});

const db = {};
db.sequelize = sequelize;
db.user = require("../models/user.model.js")(sequelize, Sequelize);
db.role = require("../models/role.model.js")(sequelize, Sequelize);
db.refreshToken = require("../models/refreshToken.model.js")(
    sequelize,
    Sequelize
);
db.pwdResets = require("../models/pwdReset.model.js")(sequelize, Sequelize);
db.cards = require("../models/card.model.js")(sequelize, Sequelize);
db.depositrequests = require("../models/depositrequest.model")(
    sequelize,
    Sequelize
);
db.depositpayments = require("../models/depositpayment.model")(
    sequelize,
    Sequelize
);
db.webhookcalls = require("../models/webhookcalls.model")(sequelize, Sequelize);
db.banktransactions = require("./banktransactions.model")(sequelize, Sequelize);
db.emailVerification = require("./emailVerification.model")(
    sequelize,
    Sequelize
);

db.pwdResets.belongsTo(db.user, {
    foreignKey: "userId",
    targetKey: "id",
});
db.user.hasOne(db.pwdResets, {
    foreignKey: "userId",
    targetKey: "id",
});

db.role.belongsToMany(db.user, {
    through: "user_roles",
    foreignKey: "roleId",
    otherKey: "userId",
});
db.user.belongsToMany(db.role, {
    through: "user_roles",
    foreignKey: "userId",
    otherKey: "roleId",
});
db.refreshToken.belongsTo(db.user, {
    foreignKey: "userId",
    targetKey: "id",
});
db.user.hasOne(db.refreshToken, {
    foreignKey: "userId",
    targetKey: "id",
});

db.user.hasMany(db.depositpayments, {
    foreignKey: "userId",
    targetKey: "id",
});
db.depositpayments.belongsTo(db.user);

db.cards.hasMany(db.depositpayments, {
    foreignKey: "cardId",
    targetKey: "id",
});
db.depositpayments.belongsTo(db.cards);

db.user.hasMany(db.depositrequests, {
    foreignKey: "userId",
    targetKey: "id",
});
db.depositrequests.belongsTo(db.user);

db.cards.hasMany(db.depositrequests, {
    foreignKey: "cardId",
    targetKey: "id",
});
db.depositrequests.belongsTo(db.cards);

db.ROLES = ["user", "admin", "moderator"];

module.exports = db;
