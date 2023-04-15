const db = require("../models");
const puppeteer = require('puppeteer');
const inquirer = require('inquirer');

async function scrape(endDate, endTxId) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto('https://ib.bankofabyssinia.com/');
    await page.waitForNavigation({ timeout: 0 });
    await page.waitForSelector("#C2__USER_NAME");

    // userId
    await page.type("#C2__USER_NAME", process.env.BANK_INFO_BOA_USERNAME);
    // password
    await page.type("#C2__QUE_21AA8B8279AB849B5250", process.env.BANK_INFO_BOA_PASSWORD);

    // auth mode
    try {
        // sms
        await page.click("#C2__FS_QUE_4D4E54A9B7D58698533518 > div:nth-child(2) > label");

        // push
        // await page.click("#C2__FS_QUE_4D4E54A9B7D58698533518 > div:nth-child(3) > label");
    }
    catch (err) {
        console.log(err);
    }

    //sign in button
    try {
        await page.click("#C2__BUT_E08B195153315344131925");
    }
    catch (err) {
        console.log(err);
    }


    var inputs = await inquirer.prompt([{ type: 'input', name: 'otp', message: "Otp code ?" }]);
    var otp = inputs['otp'];

    // otp input
    await page.type("#C2__QUE_4D4E54A9B7D58698919270", otp);

    // otp confirm button
    try {
        await page.click("#C2__row_BUT_4D4E54A9B7D58698919273");
    }
    catch (err) {
        console.log(err);
    }


    await page.waitForNetworkIdle();

    await page.waitForSelector("body .tc-screenMask", { hidden: true });
    await page.waitForSelector("#C4__BUT_24F5564B01540E1C49785_R1");


    // go to first account
    try {
        await page.evaluate((selector) => document.querySelector(selector).click(), "#C4__BUT_24F5564B01540E1C49785_R1");
        // await retryWithDelay(page.click("#C4__BUT_24F5564B01540E1C49785_R1"), 3000, 3);
    }
    catch (err) {
        console.log(err);
    }

    await page.waitForSelector("body .tc-screenMask", { hidden: true });

    await page.waitForSelector("#C4__C2__p4_BUT_ACA949ED59CB7DCE114096_R1");
    await page.waitForSelector("#C4__C2__TBL_419320BE4FFA5116134597 > tbody > tr:nth-child(1)");

    var txList = [];
    var isFirstPage = true;
    var looping = true;
    while (looping) {
        if (!isFirstPage) {
            // next button
            try {
                await page.waitForNetworkIdle();
                await retryWithDelay(page.click("#C4__C2__BUT_419320BE4FFA5116140550"), 3000, 3);
            }
            catch (err) {
                console.log(err);
            }
            await page.waitForSelector("body .tc-screenMask", { hidden: true });

        }
        else {
            isFirstPage = false;
        }

        try {
            await page.waitForSelector("#C4__C2__p4_BUT_ACA949ED59CB7DCE114096_R1");
            await page.waitForSelector("#C4__C2__TBL_419320BE4FFA5116134597 > tbody > tr:nth-child(1)");
            await page.waitForNetworkIdle();
        } catch {
            looping = false;

            break;
        }

        let handle = (rows) => {
            let a = Array.from(rows, row => {
                const dateEl = row.querySelector('td:nth-child(2)');

                const date = dateEl.textContent.trim();
                const detailEl = row.querySelector('td:nth-child(3)');
                const detail = detailEl.textContent.trim();
                const txId = detail.substring(detail.lastIndexOf(' ')).split("\\")[0].trim();
                const amountEl = row.querySelector('td:nth-child(4)');
                const amount = parseFloat(amountEl.textContent.trim().replace(/,/g, ''));
                return { txId, date, detail, amount };
            });
            return a;
        };

        let result = [];
        try {
            result = await page.$$eval('#C4__C2__TBL_419320BE4FFA5116134597 > tbody tr', handle);
        } catch { }

        for (let i = 0; i < result.length; i++) {
            let txn = result[i];

            let dates = txn.date.split("/");
            // let date = new Date(Number(dates[2]), Number(dates[1]), Number(dates[0]));
            let date = new Date(`${dates[2]}-${dates[1]}-${dates[0]}T00:00:00.000+03:00`);

            txn.date = date;
        }

        if (endDate) {
            let index = result.findIndex(tx => tx.date < endDate);

            if (index != -1) {
                looping = false;
                result.length = index + 1;
            }
        }

        if (endTxId) {
            let index = result.findIndex(tx => tx.txId === endTxId);
            if (index !== -1) {
                looping = false;
                result.length = index;
            }
        }

        txList = txList.concat(result);
    }

    // var sum = txList.filter(x => x.amount > 0).reduce((a, b) => a.amount + b.amount, 0);

    // var ss = txList.map(x => x.amount);

    return txList;


    //    var text = await page.evaluate(element => element.textContent, element)
    //    console.log(text)
    //    browser.close()
}

async function retryWithDelay(promise, delay, retries) {
    for (let i = 0; i < retries; i++) {
        try {
            return await promise;
        }
        catch (err) {
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

exports.paymenthook = async (req, res) => {
    const latestTransaction = await db.banktransactions.findOne({
        order: [['date', 'DESC']]
    });

    let scrapeStart = undefined, lastTransactionId = undefined;
    if (latestTransaction) {
        scrapeStart = new Date(latestTransaction.date);
        lastTransactionId = latestTransaction.transactionId;
    }

    const data = await scrape(scrapeStart, lastTransactionId);
    let bankTransactions = data.map(txn => {
        let a = {
            bank: "abyssinia",
            transactionId: txn.txId,
            date: txn.date,
            amount: txn.amount,
            detail: JSON.stringify({
                detail: txn.detail
            })
        };
        return a;
    });

    // sort by date before adding to db
    bankTransactions = bankTransactions.sort((a,b) => (a.date > b.date) ? 1 : ((b.date > a.date) ? -1 : 0));

    await db.banktransactions.bulkCreate(bankTransactions);

    return res.status(200).send({ message: "Works", latestTransaction });
};

exports.paymentverificationhook = async (req, res) => {
    // get unverified payments
    const unverifiedPayments = await db.depositpayments.findAll({
        where: {
            verificationStatus: "pending"
        }
    });

    // loop and check transaction using the bank verification and transaction id, verify date and amount as well
    const verifiedPaymentIds = [], amountMismatchPaymentIds = [], dateMismatchPaymentIds = [];

    for (const payment of unverifiedPayments) {
        var transaction = await db.banktransactions.findOne({
            where: {
                bank: payment.bankShortCode,
                transactionId: payment.transactionId
            }
        });

        if (transaction == null) {
            continue;
        }

        // CHECK THE AMOUNT VALIDITY
        if (payment.amountETB < (transaction.amount - 1)) {
            amountMismatchPaymentIds.push(payment.id);

            continue;
        }

        // CHECK THE DATE VALIDITY
        if (payment.createdAt < transaction.date) {
            dateMismatchPaymentIds.push(payment.id);

            continue;
        }

        // verify payment
        verifiedPaymentIds.push(payment.id);
    }

    // mark payments
    await db.depositpayments.update(
        { verificationStatus: "amount_less_than_required" },
        {
            where: {
                id: amountMismatchPaymentIds,
            },
        }
    );

    await db.depositpayments.update(
        { verificationStatus: "date_before_transaction" },
        {
            where: {
                id: dateMismatchPaymentIds,
            },
        }
    );

    await db.depositpayments.update(
        { verificationStatus: "verified" },
        {
            where: {
                id: verifiedPaymentIds,
            },
        }
    );

    res.status(200).send({
        message: "Done!"
    });
}

exports.webhookget = async (req, res) => {
    return res.status(200).send({ message: "Works" });
};