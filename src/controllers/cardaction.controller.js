const db = require("../models");
const sanity = require("../sanity");
const axios = require("../shared/solypay");
const functions = require("../shared/functions");

exports.withdrawal = async (req, res) => {
    const { card_id, amount } = req.body;

    if (!card_id || !amount) {
        return res.status(400).send({ message: 'Malformed Request' });
    }

    try {
        var user = await db.user.findOne({ where: { id: req.userId } });
        var card = await db.cards.findOne({ where: { id: card_id } });

        if (!card)
            return res.status(404).json({ message: "Card not found." });

        if (card.status !== "issued" || !card.card_solypay_id)
            return res.status(404).json({ message: "Card not eligible for withdrawal." });

        var response = await axios.api.get("/virtual_cards/" + card.card_solypay_id);

        if (!response.data.data)
            return res.status(404).json({ message: "Card not found." });

        card = response.data.data;

        var exchangeRate = await functions.getExchangeRate();
        var data = {
            _type: "withdrawalRequests",
            name: card.name_on_card,
            cardNumber: card.card_pan,
            emailAddress: user.email,
            amount: Number(amount),
            dollarExchangeRate: exchangeRate,
            amountETB: Number(Number(amount) * exchangeRate),
            markAsDone: false
        }

        await sanity.client.create(data);

        return res.json({ message: "Withdrawal requested." });
    } catch (err) {
        return res.status(500).send({ message: err.message });
    }
};

exports.deposit = async (req, res) => {
    const { card_id, amount } = req.body;

    if (!card_id || !amount) {
        return res.status(400).send({ message: 'Malformed Request' });
    }

    try {
        if (Number(amount) < 50)
            return res.status(400).send({ message: 'The minimum deposit amount is $50' });

        if (Number(amount) > 500000)
            return res.status(400).send({ message: 'The maximum deposit amount is $500,000' });

        var card = await db.cards.findOne({ where: { id: card_id } });

        if (!card)
            return res.status(404).json({ message: "Card not found." });

        if (card.status !== "issued" || !card.card_solypay_id)
            return res.status(404).json({ message: "Card not eligible for deposit." });

        var response = await axios.api.get("/virtual_cards/" + card.card_solypay_id);

        if (!response.data.data)
            return res.status(404).json({ message: "Card not found." });

        card = response.data.data;

        var exchangeRate = await functions.getExchangeRate();
        var data = {
            userId: req.userId,
            cardId: card_id,
            amount,
            dollarExchangeRate: exchangeRate,
            amountETB: Number(Number(amount) * exchangeRate)
        }

        await db.depositrequests.create(data);

        return res.json({ message: "Deposit requested." });
    } catch (err) {
        return res.status(500).send({ message: err.message });
    }
};