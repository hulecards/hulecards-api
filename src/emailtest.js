// const sgMail = require('@sendgrid/mail')
// sgMail.setApiKey("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")
// const msg = {
//     to: 'minasploit@gmail.com', // Change to your recipient
//     from: 'noreply@hulecards.com', // Change to your verified sender
//     subject: 'Sending with SendGrid is Fun',
//     templateId: 'd-997cacdcb27941c6971db1871630d53b',
//     dynamic_template_data: {
//         first_name: 'Minasie',
//         date: (new Date()).toLocaleDateString()
//     },
// }
// sgMail
//     .send(msg)
//     .then(() => {
//         console.log('Email sent')
//     })
//     .catch((error) => {
//         console.error(error)
//     })

const mailchimpFactory = require("@mailchimp/mailchimp_transactional/src/index.js");
const mailchimp = mailchimpFactory("EAHNRivS1AoYqXjuL64O_w");

const message = {
    from_email: "noreply@hulecards.com",
    subject: "Verification code",
    to: [
        {
            email: "yonialemye@gmail.com",
            type: "to"
        }
    ]
};

async function run() {
    const response = await mailchimp.messages.sendTemplate({
        template_name: "test-template",
        template_content: [{}],
        message
    });
    console.log(response);
}

run();

// const hulemail = require("./templates/hulemail");

// async function run() {
//     await hulemail.send("minasploit@gmail.com", "cardaccepted", "Minasie Shibeshi", null, (err, info) => {
//         console.log(err, info);
//     });
// }

// run();