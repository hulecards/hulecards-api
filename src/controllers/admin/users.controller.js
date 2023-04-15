const db = require("../../models");
const axios = require("../../shared/solypay");
const hulemail = require("../../templates/hulemail");
const email = require("../../email/email");

exports.list = async (req, res) => {

    let { page, limit } = req.query;

    try {
        page = page ?? 0;
        limit = limit ?? 5;

        page = Number(page);
        limit = Number(limit);

        if (page < 0 || limit < 0)
            throw new Error("Invalid input");
    } catch {
        return res.status(400).send({ message: "Invalid input" });
    }

    try {
        let results = await db.user.findAndCountAll({
            order: [['fullName', 'ASC']],
            limit,
            offset: page * limit
        });

        for (const user of results.rows.map(result => result.dataValues)) {
            delete user.password
        }

        results = {
            limit,
            page,
            offset: page * limit,
            ...results
        }

        return res.status(200).send(results);
    } catch (err) {
        return res.status(500).send({ message: err.message });
    }
};