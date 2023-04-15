const db = require("../models");
const axios = require("../shared/solypay");
const hulemail = require("../templates/hulemail");
const email = require("../email/email");

exports.getorders = async (req, res) => {
    try {
        let orders = await db.depositpayments.findAll({
            where: {
                isCardRegistration: true,
                status: "paid",
            },
            include: [db.user, db.cards],
        });

        return res.status(200).send(orders);
    } catch (err) {
        return res.status(500).send({ message: err.message });
    }
};

exports.getdeposits = async (req, res) => {
    try {
        let deposits = await db.depositpayments.findAll({
            where: {
                isCardRegistration: false,
                status: "paid",
            },
            include: [db.user, db.cards],
        });

        return res.status(200).send(deposits);
    } catch (err) {
        return res.status(500).send({ message: err.message });
    }
};

exports.approveorder = async (req, res) => {
    let order = req.body;

    const name = order.user.fullName.split(" ");

    try {
        var hasValidPromo = false;

        console.log("Admin approve Request for: ");

        console.log({
            amount: order.initialDepositInUsd,
            currency: "USD",
            first_name: name[0],
            last_name: name.length > 1 ? name.slice(1).join(" ") : "",
            account_id: "9294f014-67a3-445c-928d-ccdfbf83b43b",
            email: order.user.email,
        });

        var response = await axios.api.post("/virtual_cards/create", {
            amount: order.initialDepositInUsd,
            currency: "USD",
            first_name: name[0],
            last_name: name.length > 1 ? name.slice(1).join(" ") : "",
            account_id: "9294f014-67a3-445c-928d-ccdfbf83b43b",
            email: order.user.email,
        });

        await db.cards.update(
            {
                status: "issued",
                card_solypay_id: response.data.data.id,
                card_solypay_hash: response.data.data.card_hash,
            },
            { where: { id: order.card.id } }
        );

        await db.depositpayments.update(
            {
                status: "verified",
            },
            { where: { id: order.id } }
        );

        // email.send(order.user.email, "cardaccepted", order.user);

        await hulemail.send(
            order.user.email,
            "cardaccepted",
            order.user.fullName
        );
        // await hulemail.send(order.user.email, "promocodeapplied", order.user.fullName);

        console.log(
            `Card approved: ${order.user.fullName} (${order.user.email})`
        );

        return res.status(200).send({ message: "Card approved" });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: err.message });
    }
};

exports.declineorder = async (req, res) => {
    try {
        await db.cards.update(
            { status: "declined" },
            { where: { id: req.body.cardId } }
        );

        await db.depositpayments.update(
            { status: "declined" },
            { where: { id: req.body.id } }
        );

        const user = await db.user.findByPk(req.body.userId);

        // email.send(user.email, "carddeclined", user);

        await hulemail.send(user.email, "carddeclined", user.fullName);

        console.log(`Card declined: ${user.fullName} (${user.email})`);

        return res.status(200).send({ message: "Card declined" });
    } catch (err) {
        return res.status(500).send({ message: err.message });
    }
};

exports.approvedeposit = async (req, res) => {
    let deposit = req.body;

    try {
        await axios.api.post(
            `/virtual_cards/fund/${deposit.card.card_solypay_id}`,
            {
                amount: Number(deposit.initialDepositInUsd),
                currency: "USD",
            }
        );

        await db.depositpayments.update(
            {
                status: "verified",
            },
            { where: { id: deposit.id } }
        );

        const user = await db.user.findByPk(req.body.userId);

        // email.send(user.email, "depositaccepted", user);

        await hulemail.send(user.email, "depositaccepted", user.fullName);

        console.log(
            `Deposit approved: ${order.user.fullName} (${order.user.email})`
        );

        return res.status(200).send({ message: "Deposit approved" });
    } catch (err) {
        return res.status(500).send({ message: err.message });
    }
};

exports.declinedeposit = async (req, res) => {
    try {
        await db.depositpayments.update(
            { status: "declined" },
            { where: { id: req.body.id } }
        );

        const user = await db.user.findByPk(req.body.userId);

        // email.send(user.email, "depositdeclined", user);

        await hulemail.send(user.email, "depositdeclined", user.fullName);

        console.log(`Deposit declined: ${user.fullName} (${user.email})`);

        return res.status(200).send({ message: "Deposit declined" });
    } catch (err) {
        return res.status(500).send({ message: err.message });
    }
};
