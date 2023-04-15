exports.send = function (email, subject, htmlcontent, attachments, callback) {
    var nodemailer = require('nodemailer');
    var smtpTransport = require('nodemailer-smtp-transport');

    var transporter = nodemailer.createTransport(smtpTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secureConnection: true,
        tls: {
            rejectUnauthorized: false
        },
        auth: {
            user: process.env.EMAIL_ADDRESS,
            pass: process.env.EMAIL_PASSWORD
        }
    }));

    var mailOptions = {
        from: "Hule Cards <noreply@hulecards.com>",
        to: email,
        subject: subject,
        html: htmlcontent,
        attachments: attachments
    };

    transporter.sendMail(mailOptions, function (err, info) {
        transporter.close();
        if (err) {
            callback && callback(err, info);
        }
        else {
            callback && callback(null, info);
        }
    });
}