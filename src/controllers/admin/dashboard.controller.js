const db = require("../../models");
const axios = require("../../shared/solypay");
const hulemail = require("../../templates/hulemail");
const email = require("../../email/email");

exports.info = async (req, res) => {
    try {
        const [results, metadata] = await db.sequelize.query(
            "select (select  count(*) from users) as users, " +
            "(select  count(*) from depositpayments where STATUS = 'paid') as pendingRequests, " +
            "(select  count(*) from depositrequests) as depositRequests, " +
            "(select  count(*) from cards where STATUS = 'issued') as cards;"
        );

        const data = { dashboard: results[0] };

        return res.status(200).send(data);
    } catch (err) {
        return res.status(500).send({ message: err.message });
    }
};