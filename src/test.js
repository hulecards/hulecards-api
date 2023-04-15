const puppeteer = require('puppeteer')
const inquirer = require('inquirer')

async function scrape(endDate, endTxId) {
    const browser = await puppeteer.launch({ headless: false, })
    const page = await browser.newPage()

    await page.goto('https://ib.bankofabyssinia.com/')
    await page.waitForNavigation({ timeout: 0 });
    await page.waitForSelector("#C2__USER_NAME")

    // userId
    await page.type("#C2__USER_NAME", "IB7721071");
    // password
    await page.type("#C2__QUE_21AA8B8279AB849B5250", "Da@123");

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

        await page.waitForSelector("#C4__C2__p4_BUT_ACA949ED59CB7DCE114096_R1");
        await page.waitForSelector("#C4__C2__TBL_419320BE4FFA5116134597 > tbody > tr:nth-child(1)");
        await page.waitForNetworkIdle();
/* 
        var breakNow = false;
        try {
            await page.$('//div[@id="C4__C2__row_HEAD_8D7C9CFAAE7A916F28037" and contains(@style,"display: none")]')
            // Does exist
          } catch {
            // Does not. reached end of list.
            looping = false;
            breakNow = true;
          }
        if (breakNow) {
            break;
        } */
        let handle = (rows) => {
            console.log("adadad");
            let a = Array.from(rows, row => {
                const dateEl = row.querySelector('td:nth-child(2)');
                const date = dateEl.textContent.trim();
                const detailEl = row.querySelector('td:nth-child(3)');
                const detail = detailEl.textContent.trim();
                const txId = detail.substring(detail.lastIndexOf(' ')).trim();
                const amountEl = row.querySelector('td:nth-child(4)');
                const amount = parseFloat(amountEl.textContent.trim().replace(/,/g, ''));
                return { txId, date, detail, amount };
            });
            return a;
        };
        const result = await page.$$eval('#C4__C2__TBL_419320BE4FFA5116134597 > tbody tr', handle);

        if ((endDate && (result.findIndex(tx => tx.date === endDate) !== -1)) || (endTxId && (result.findIndex(tx => tx.txId === endTxId) !== -1))) {
            looping = false;
        }

        txList = txList.concat(result);
        console.log(result);

    }

    console.log(txList);

    
    console.log(JSON.stringify(txList));

    var sum = txList.filter(x=>x.amount>0).reduce((a, b) => a.amount + b.amount, 0);
    
    var ss = txList.map(x=>x.amount);
    console.log(ss);
    console.log(sum);



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

scrape('20/06/2022', undefined)