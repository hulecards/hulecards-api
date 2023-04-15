const db = require("../models");
const axios = require("../shared/solypay");
const formatter = require("../card_number_format");
const readXlsxFile = require('read-excel-file/node')

exports.order = async (req, res) => {
    try {
        let { firstName, lastName, nickName } = req.body;

        let nameOnCard = `${firstName} ${lastName}`;

        let user = null;

        if (!firstName || !lastName) {
            user = await db.user.findOne({ where: { id: req.userId } });
            nameOnCard = user.fullName;
        }

        var card = await db.cards.create({
            userId: req.userId,
            nickName,
            nameOnCard
        });

        if (user)
            console.log(`Card ordered: Nickname: ${nickName} ${user.fullName} (${user.email})`);
        else
            console.log(`Card ordered: Nickname: ${nickName} ${req.userId}`);

        return res.status(200).send(card);
    } catch (err) {
        return res.status(500).send({ message: err });
    }
};

exports.my = async (req, res) => {
    try {
        var myCards = await db.cards.findAll({
            where: {
                userId: req.userId
            }
        });

        var allCards = (await axios.api.get("/virtual_cards")).data.data;

        const cards = [];
        for (let i = 0; i < myCards.length; i++) {
            let c = myCards[i];
            c.dataValues.details = null;

            if (c.dataValues.card_solypay_id) {
                let card_info = allCards.filter(cc => cc && cc.id == c.dataValues.card_solypay_id)[0];
                if (card_info != undefined) {
                    c.dataValues.details = {
                        id: card_info.id,
                        number: formatter.cc_format(card_info.card_pan),
                        expiration: card_info.expiration,
                        cvv: card_info.cvv,
                        amount: Number(card_info.amount),
                        nameOnCard: card_info.name_on_card
                    }
                }
            }

            cards.push(c);
        }

        return res.status(200).send(cards);
    } catch (err) {
        return res.status(500).send({ message: err.message });
    }
};

exports.getOne = async (req, res) => {
    try {
        var card = await db.cards.findOne({
            where: {
                id: req.params.id,
                userId: req.userId
            }
        });

        if (card == null)
            return res.status(404).send({ message: "Not found" });

        return res.status(200).send(card);
    } catch (err) {
        return res.status(500).send({ message: err });
    }
};

exports.transactions = async (req, res) => {
    try {

        var card = await db.cards.findOne({ where: { id: req.params.id } });
        if (card == null)
            return res.status(404).json({ message: "Card not found" });

        if (!card.card_solypay_id)
            return res.json([]);

        var response = await axios.api.get("/virtual_cards/transactions/" + card.card_solypay_id);

        const transactions = [];
        response.data.data.forEach(t_info => {
            var transaction = {
                id: t_info.id,
                amount: t_info.amount,
                status: t_info.status,
                description: t_info.description,
                type: t_info.type,
                live: t_info.live,
                createdAt: t_info.created_at,
                updatedAt: t_info.updated_at
            }

            transactions.push(transaction);
        });

        console.log(`Transaction fetched: ${card.nickName}:(${req.params.id})`);

        res.status(200).send(transactions);
    } catch (err) {
        return res.status(500).send({ message: err.message });
    }
};

exports.import = async (req, res) => {
    const { cardNumber, cvv, nameOnCard } = req.body;

    if (!cardNumber, !cvv, !nameOnCard)
        return res.send(400).json({ message: "Malformed request" });

    try {
        let cards = await readXlsxFile('jksdnfkubskuehrkjsdn.xlsx');
        let filteredCards = cards.filter(c => String(c[2]).toLowerCase() == String(cardNumber).toLowerCase() && String(c[3]).toLowerCase() == String(cvv).toLowerCase() && String(c[4]).toLowerCase() == String(nameOnCard).toLowerCase());

        if (filteredCards && filteredCards !== []) {
            let card = filteredCards[0];

            if (card === undefined)
                return res.status(404).json({ message: "Card information incorrect. Please refer to the email you got when you received your card." });

            var existingCard = await db.cards.findOne({
                where: {
                    card_solypay_id: card[0]
                }
            });

            if (existingCard != null) {
                return res.status(404).json({ message: "Card already exists." });
            }

            await db.cards.create({
                userId: req.userId,
                card_solypay_id: card[0],
                card_solypay_hash: card[1],
                status: "issued"
            });

            console.log(`Card imported: ${cardNumber}`);

            return res.status(200).json({ message: "Card imported" });
        } else {
            return res.status(404).json({ message: "Card information incorrect. Please refer to the email you got when you received your card" });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}