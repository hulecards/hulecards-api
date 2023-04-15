const db = require("../models");
const hulemail = require("../templates/hulemail");
const email = require("../email/email");
const { Op } = require("sequelize");

exports.test = async function (req, res) {
    // PROMO CODE USERS
    let orders = await db.depositpayments.findAll({
        where: {
            promoCode: {
                [Op.in]: ["ethiotech", "eytaye", "robusta"]
            },
            status: {
                [Op.in]: ["paid", "verified"]
            },
            promoCodeApplied: false
        }
    });

    console.log(orders.length);
    res.send(orders);

    // MIGRATE LOST DEPOSITS
    // try {
    //     let a = await db.sequelize.query("INSERT INTO hulecards_api_db.depositpayments SELECT * FROM hulecard_api_db_restore.depositpayments WHERE NOT EXISTS(SELECT * FROM hulecard_api_db.depositpayments WHERE hulecard_api_db_restore.depositpayments.id = hulecard_api_db.depositpayments.id)")

    //     return res.status(200).send(a);
    // } catch (err) {
    //     return res.status(500).send({ message: err, data });
    // }

    // await hulemail.send("leul.zene@gmail.com", "announcement", "Leul Zenebe");

    // let users = await db.user.findAll();

    // for (let index = 0; index < users.length; index++) {
    //     const user = users[index];
        
    //     await hulemail.send(user.email, "announcement", user.fullName, null, (err, info) => {
    //         if (err) {
    //             console.log("====================================> Error sending email to " + user.email);
    //         } else {
    //             console.log("Sent to ", user.fullName, " ", user.email);
    //         }
    //     });
    // }

    // users.forEach(async (user) => {
    //     await hulemail.send(user.email, "announcement", user.fullName, null, (err, info) => {
    //         if (err) {
    //             console.log("====================================> Error sending email to " + user.email);
    //         } else {
    //             console.log("Sent to ", user.fullName, " ", user.email);
    //         }
    //     });


    // });

    // res.json(users);
}