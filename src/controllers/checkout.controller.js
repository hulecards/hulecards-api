const db = require("../models");
const functions = require("../shared/functions");
const hulemail = require("../templates/hulemail");

exports.checkout = async (req, res) => {
    // validate data
    if (req.body.type === undefined ||
        req.body.name === undefined ||
        req.body.bank === undefined ||
        req.body.bankShortCode === undefined ||
        req.body.transactionId === undefined ||
        (req.body.type === "premiumCardCheckouts" && req.body.initialDeposit === undefined) ||
        (req.body.type === "premiumCardCheckouts" && req.body.dollarExchangeRate === undefined)) {

        return res.status(400).send({ message: 'Malformed Request' });
    }

    var isRegistration = req.body.type === "premiumCardCheckouts";

    try {
        var data = {
            userId: req.userId,
            bank: req.body.bank,
            transactionId: req.body.transactionId,
            bankShortCode: req.body.bankShortCode,
            promoCode: req.body.promoCode,
            dollarExchangeRate: Number(req.body.dollarExchangeRate),
            isCardRegistration: isRegistration,
            cardId: Number(req.body.orderCardId),
            initialDepositInUsd: Number(req.body.initialDeposit),
            dollarExchangeRate: Number(req.body.dollarExchangeRate),
            amountETB: Number(Number(req.body.initialDeposit) * Number(req.body.dollarExchangeRate))
        }

        // validate checkout amount
        if (isRegistration) {
            if (Number(req.body.initialDeposit) < 5) {
                return res.status(400).send({ message: 'The minimum initial deposit amount is $5' });
            } else if (Number(req.body.initialDeposit) > 500) {
                return res.status(400).send({ message: 'The maximum initial deposit amount is $500' });
            }
        } else {
            if (Number(req.body.initialDeposit) < 50) {
                return res.status(400).send({ message: 'The minimum deposit amount is $50' });
            } else if (Number(req.body.initialDeposit) > 500000) {
                return res.status(400).send({ message: 'The maximum deposit amount is $500,000' });
            }
        }

        var user = await db.user.findOne({ where: { id: req.userId } });

        // validate duplicate transaction ID
        let existingPaymentWithDuplicateTransactionID = await db.depositpayments.findOne({
            where: {
                transactionId: req.body.transactionId,
                status: ["verified", "paid"]
            }
        });

        if (existingPaymentWithDuplicateTransactionID != null) {
            if (isRegistration) {
                // email.send(user.email, "cardinreview", user);
                hulemail.send(user.email, "cardinreview", user.fullName);
            } else {
                // email.send(user.email, "depositinreview", user);
                hulemail.send(user.email, "depositinreview", user.fullName);
            }

            console.log(`Faked checkout: ${user.fullName} (${user.email})`);

            res.json({ message: "Checkout registered." });

            return;
        }

        let fileInfo = await functions.uploadFile(req, "receipt");

        if (fileInfo) {
            data.receipt = fileInfo.path;
        }

        await db.depositpayments.create(data);

        // update the card status to paid if the payment type is registration
        if (req.body.orderCardId && isRegistration) {
            await db.cards.update(
                {
                    order_transaction_id: req.body.transactionId,
                    status: "paid"
                },
                {
                    where: {
                        userId: req.userId,
                        id: req.body.orderCardId
                    }
                }
            );
        }

        if (isRegistration) {
            // email.send(user.email, "cardinreview", user);
            hulemail.send(user.email, "cardinreview", user.fullName);
        } else {
            // email.send(user.email, "depositinreview", user);
            hulemail.send(user.email, "depositinreview", user.fullName);
        }

        console.log(`Checkout registered: ${user.fullName} (${user.email})`);

        res.json({ message: "Checkout registered." });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};