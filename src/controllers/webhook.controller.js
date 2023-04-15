const db = require("../models");
const hulemail = require("../templates/hulemail");
const axios = require("../shared/solypay");

exports.webhook = async (req, res) => {
    const { data } = req.body;

    // console.log(req);

    async function otp(req, res) {
        let card = await db.cards.findOne({
            where: {
                card_solypay_id: data.CardId
            }
        });

        let email = "";
        let fullName = "";

        if (card == null) {
            // send request to solypay and fetch the email from there

            var response = await axios.api.get("/virtual_cards/" + data.CardId);

            if (!response.data.data)
                return res.status(404).json({ message: "Card not found." });

            card = response.data.data;

            email = card.card_email;
            fullName = card.name_on_card;
        } else {
            // get the email from our own database

            let user = await db.user.findOne({
                where: {
                    id: card.userId
                }
            });
    
            if (user == null) {
                return res.status(404).send({ message: "User associated with card not found" });
            }

            email = user.email;
            fullName = user.fullname;
        }

        // send transaction otp to email
        await hulemail.send(email, "cardotp", fullName, {
            code: data.Otp
        });

        return res.status(200).send({ message: "OTP", data });
    }

    async function transaction(req, res) {
        return res.status(200).send({ message: "CHARGE", data });
    }

    try {
        switch (req.body["event.type"]) {
            case "virtual.otp":
                await otp(req, res);

                return;
            case "virtual.charge":
                await transaction(req, res);

                return;
        }

        return res.status(400).send({ message: "Unrecognized webhoook type." });
    } catch (err) {
        return res.status(500).send({ message: err.message });
    }
};

exports.webhookget = async (req, res) => {
    return res.status(200).send({ message: "Works" });
};