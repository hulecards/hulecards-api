const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const CardNotificationsGroupId = 19563;

const emailTemplateIDs = {
    "depositdeclined": "d-997cacdcb27941c6971db1871630d53b",
    "depositaccepted": "d-9d507ccbc79b42fb9bc45ee7d95c5cd0",
    "depositinreview": "d-f18b841cd8ef4eb294215d502ebeee5f",
    "carddeclined": "d-f54f8b614d734cb8bf0e4bc97e3991c3",
    "cardaccepted": "d-8f3a05a999e344ebbd251f71f6ddd308",
    "cardinreview": "d-f899d46132634cb6a542ea9925884a53",
    "forgotpassword": "d-1b8ff5681a5a4de5b4805c09688c151b"
}

const emailGroupIDs = {
    "depositdeclined": CardNotificationsGroupId,
    "depositaccepted": CardNotificationsGroupId,
    "depositinreview": CardNotificationsGroupId,
    "carddeclined": CardNotificationsGroupId,
    "cardaccepted": CardNotificationsGroupId,
    "cardinreview": CardNotificationsGroupId
}

exports.send = async (email, type, user, template_data) => {
    const msg = {
        to: email,
        from: 'Hule Cards <noreply@hulecards.com>',
        subject: "hi",
        templateId: emailTemplateIDs[type],
        dynamic_template_data: {
            first_name: user.fullName,
            date: (new Date()).toDateString(),
            ...template_data
        }
    }

    let groupId = emailGroupIDs[type];
    if (groupId) {
        msg.asm = {
            group_id: groupId
        }
    }
    
    try {
        await sgMail.send(msg);
        return {
            success: true,
            error: null
        }
    } catch (error) {
        console.log("Error sending email to user. Error: ", error);
        return {
            success: false,
            error
        }
    }
}