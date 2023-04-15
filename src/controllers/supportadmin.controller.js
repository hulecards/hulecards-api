const db = require("../models");
const axios = require("../shared/solypay");

exports.getinfo = async (req, res) => {
    try {
        let user = await db.user.findOne({
            where: {
                email: req.body.email
            }
        });

        if (!user) {
            return res.status(404).send({
                message: "A user with that email was not found"
            });
        }

        let cards = await db.cards.findAll({
            where: {
                userId: user.id
            }
        });

        let depositPayments = await db.depositpayments.findAll({
            where: {
                userId: user.id
            }
        });

        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];

            cards[i].dataValues.depositPayments = depositPayments.filter(d => d.cardId == card.id);

            if (card.card_solypay_id != null) {
                try {
                    cards[i].dataValues.details = (await axios.api.get("/virtual_cards/" + card.card_solypay_id)).data.data;
                } catch {
                    cards[i].dataValues.details = {
                        masked_card: "=== ERROR LOADING CARD INFO ==="
                    }
                }

                try {
                    cards[i].dataValues.transactions = (await axios.api.get("/virtual_cards/transactions/" + card.card_solypay_id)).data.data;
                } catch {
                    cards[i].dataValues.transactions = [
                        {
                            amount: "",
                            type: "ERROR",
                            description: "Error getting transactions for this card",
                            created_at: "",
                            status: ""
                        }
                    ]
                }
            }
        }

        let response = {
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                identification: user.identification
            },
            cards: cards,
            depositPayments: depositPayments
        };

        console.log(`Info extracted for support: ${user.fullName} (${user.email})`);

        return res.status(200).send(response);
    } catch (err) {
        return res.status(500).send({ message: err.message });
    }
};