require('dotenv').config();
const nodemailer = require('nodemailer');
const { htmlParser } = require('./html_parser');
const { logger } = require('./logger');

const options = {
    host: 'smtp.sendgrid.net',
    port: 465,
    pool: true,
    secure: true,
    rateDelta: 60000,
    rateLimit: 500,
    auth: {
        user: 'apikey',
        pass: process.env.SENDGRID,
    },
};

const transporter = nodemailer.createTransport(options);

async function sendMail(email, verificationCode) {
    logger.info(`Sending mail to ${email}`);
    const html = htmlParser().replace('<#verificationCode>', verificationCode);

    return new Promise(
        (resolve) =>
            // eslint-disable-next-line implicit-arrow-linebreak
            transporter.sendMail(
                {
                    from: `"${process.env.USER_NAME} NO-REPLY" <${process.env.GOOGLE_USER}>`,
                    to: email,
                    subject: 'Verification For #neogCamp 2022 Discord Server',
                    html,
                    attachments: [
                        {
                            path: './assets/mail/neog.png',
                            cid: 'neog',
                        },
                    ],
                },
                (e) => {
                    if (e) {
                        logger.error(`IMPORTANT: Error Occured While Sending ERROR Mail: ${e.message}`);
                        resolve(false);
                    } else {
                        logger.info(`Mail has been sent to ${email}`);
                        resolve(true);
                    }
                }
            )
        // eslint-disable-next-line function-paren-newline
    );
}

module.exports = { sendMail };
