// const axios = require('axios').default;
const sanity = require("../sanity");
var EasyFtp = require('easy-ftp');
var ftp = new EasyFtp();
const { v4: uuidv4 } = require('uuid');

exports.validpromocodes = {
    "eytaye": 5,
    "ethiotech": 5,
    "robusta": 5
}

exports.getExchangeRate = async () => {
    const query = '*[_type == "settings" && name == "dollar_exchange_rate"] {value}'
    const { value } = (await sanity.client.fetch(query))[0]

    return Number(value);
}

exports.uploadFile = async (req, filename) => {
    if (!req.files || !req.files[filename])
        return false;

    const file = req.files[filename];

    ftp.connect({
        host: process.env.FTP_HOST,
        port: 21,
        username: process.env.FTP_USER,
        password: process.env.FTP_PWD,
        type: 'ftp'
    });

    const split = file.name.split(".");
    const extension = split[split.length - 1];

    const random = uuidv4().replace(/-/g, "");
    const newFileName = `${random}.${extension}`;

    try {
        await new Promise((resolve, reject) => {
            try {
                ftp.upload(file.tempFilePath, `/${newFileName}`, function (err) {
                    if (err) {
                        reject("There was an error retrieving the file.")
                        return;
                    }
        
                    ftp.close();
        
                    resolve("Done uploading the file");
                }, function (err) {
                    reject("There was an error processing the file. Message: " + err?.message)
                    return;
                });
            } catch {
                reject("There was an error processing the file")
                    return;
            }
        });
    } catch {
        console.log("Error uploading file");
        return false;
    }

    return {
        name: newFileName, path: `/uploads/${newFileName}`
    };
}