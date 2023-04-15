const mailer = require("./mailer");
const fs = require('fs');

exports.send = async (email, type, fullName, data, callback) => {
    var header = (fs.readFileSync(__dirname + "/header.html", "utf-8")).toString();
    var footer = (fs.readFileSync(__dirname + "/footer.html", "utf-8")).toString();

    var htmlfile;

    switch (type.toLowerCase()) {
        case "cardinreview":
            htmlfile = "/card-in-review.html";

            break;
        case "cardaccepted":
            htmlfile = "/card-accepted.html";

            break;
        case "carddeclined":
            htmlfile = "/card-declined.html";

            break;
        case "depositinreview":
            htmlfile = "/deposit-in-review.html";

            break;
        case "depositaccepted":
            htmlfile = "/deposit-accepted.html";

            break;
        case "depositdeclined":
            htmlfile = "/deposit-declined.html";

            break;
        case "forgotpassword":
            htmlfile = "/forgot-password.html";

            break;
        case "promocodeapplied":
            htmlfile = "/promo-applied.html";

            break;
        case "cardotp":
            htmlfile = "/card-otp.html";

            break;
        case "announcement":
            htmlfile = "/announcement.html";

            break;
        case "emailverification":
            htmlfile = "/email-verification.html";

            break;
        default:
            throw new Error('Unrecognized email template type');
    }

    var html = (fs.readFileSync(__dirname + htmlfile, "utf-8")).toString();

    html = header + html + footer;

    html = html.replace("INSERTTODAYDATEHERE", (new Date()).toDateString());
    html = html.replace("INSERTNAMEHERE", `Hey ${fullName}, `);

    switch (type.toLowerCase()) {
        case "cardinreview":
            mailer.send(email, "Card in review - Hule Cards", html, null, callback);

            break;
        case "cardaccepted":
            mailer.send(email, "Card accepted - Hule Cards", html, null, callback);

            break;
        case "carddeclined":
            mailer.send(email, "Card declined - Hule Cards", html, null, callback);

            break;
        case "depositinreview":
            mailer.send(email, "Deposit in review - Hule Cards", html, null, callback);

            break;
        case "depositaccepted":
            mailer.send(email, "Deposit accepted - Hule Cards", html, null, callback);

            break;
        case "depositdeclined":
            mailer.send(email, "Deposit declined - Hule Cards", html, null, callback);

            break;
        case "forgotpassword":
            html = html.replace("INSERTCODEHERE", data.code);

            mailer.send(email, "Password Reset - Hule Cards", html, null, callback);

            break;
        case "promocodeapplied":
            mailer.send(email, "Promo code applied - Hule Cards", html, null, callback);

            break;
        case "cardotp":
            html = html.replace("INSERTCODEHERE", data.code);

            mailer.send(email, "Transaction OTP - Hule Cards", html, null, callback);

            break;
        case "announcement":
            mailer.send(email, "Urgent Notice - Hule Cards", html, null, callback);

            break;
        case "emailverification":
            html = html.replace("INSERTCODEHERE", data.code);
            
            mailer.send(email, "Verify Email - Hule Cards", html, null, callback);

            break;
        default:
            throw new Error("Could not decide how to send the email from it's template type");
    }
}